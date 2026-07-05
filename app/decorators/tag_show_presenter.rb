# Serializes tags#show (a single tag's landing/info page) into Inertia props for
# the React TagShow page: tag name/type, canonical + synonym status, the works
# link, and related parent/child/synonym tag pills.
class TagShowPresenter < InertiaPresenter
  def initialize(tag:, heading:)
    @tag = tag
    @heading = heading
  end

  def as_props
    t = @tag
    canonical = !!t.canonical
    has_works_link = canonical || t.merger.present?
    {
      context: { heading: @heading.to_s },
      name: t.name,
      type: t.type.to_s,
      canonical: canonical,
      worksUrl: (has_works_link ? (tag_works_path(t) rescue nil) : nil),
      worksCount: (t.taggings_count rescue 0).to_i,
      parents: tag_refs(parent_tags(t)),
      children: tag_refs(child_tags(t)),
      synonyms: tag_refs(synonym_tags(t)),
      merger: merger_ref(t)
    }
  rescue => e
    { context: { heading: @heading.to_s }, name: (t.try(:name)), error: e.message }
  end

  private

  def parent_tags(t)
    Array(t.parents).uniq.compact.sort
  rescue
    []
  end

  # Sample of direct children, capped so large fandoms don't dump every child.
  def child_tags(t)
    t.children.order(:name).limit(30).to_a
  rescue
    []
  end

  # Synonyms are the non-canonical tags merged into this canonical tag.
  def synonym_tags(t)
    return [] unless t.canonical && (t.mergers.exists? rescue false)

    t.mergers.by_name.limit(30).to_a
  rescue
    []
  end

  def merger_ref(t)
    m = t.merger
    return nil unless m

    { name: m.name, url: (tag_path(m) rescue nil) }
  rescue
    nil
  end
end
