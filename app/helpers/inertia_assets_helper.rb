module InertiaAssetsHelper
  VITE_INERTIA_PUBLIC_PATH = "/vite-inertia".freeze
  VITE_INERTIA_MANIFEST_PATH = Rails.root.join("public/vite-inertia/.vite/manifest.json")

  def inertia_vite_tags
    entry = inertia_vite_entry
    tags = []

    Array(entry["css"]).each do |css_file|
      tags << stylesheet_link_tag(inertia_vite_asset_path(css_file, extension: ".css"))
    end

    Array(entry["imports"]).each do |import_key|
      imported = inertia_vite_manifest.fetch(import_key)
      tags << tag.link(rel: "modulepreload", href: inertia_vite_asset_path(imported.fetch("file"), extension: ".js"))

      Array(imported["css"]).each do |css_file|
        tags << stylesheet_link_tag(inertia_vite_asset_path(css_file, extension: ".css"))
      end
    end

    tags << javascript_include_tag(inertia_vite_asset_path(entry.fetch("file"), extension: ".js"), type: "module")
    safe_join(tags, "\n")
  end

  private

  def inertia_vite_manifest
    @inertia_vite_manifest ||= JSON.parse(File.read(VITE_INERTIA_MANIFEST_PATH))
  end

  def inertia_vite_entry
    manifest = inertia_vite_manifest
    manifest["entrypoints/inertia.tsx"] ||
      manifest.values.find { |entry| entry["isEntry"] && entry["name"] == "inertia" } ||
      manifest.find { |key, _entry| key.end_with?("entrypoints/inertia.tsx") }&.last ||
      raise("Could not find Inertia Vite entry in #{VITE_INERTIA_MANIFEST_PATH}")
  end

  def inertia_vite_asset_path(file, extension:)
    unless file.is_a?(String) &&
           file.start_with?("assets/") &&
           file.end_with?(extension) &&
           file.exclude?("..") &&
           file.exclude?(":") &&
           file.exclude?("//")
      raise("Unexpected Inertia Vite asset path: #{file.inspect}")
    end

    "#{VITE_INERTIA_PUBLIC_PATH}/#{file}"
  end
end
