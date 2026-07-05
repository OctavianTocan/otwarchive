# Serializes skins#index into Inertia props for the React skins listing.
# Covers both the public browse (site/work) and a user's own skins view;
# each item is a Skin rendered as a blurb with byline, icon, description, and
# (for the owner view) its approval status, using the exact accessors the ERB
# blurb uses.
class SkinsIndexPresenter < InertiaPresenter
  include HtmlCleaner

  def initialize(skins:, heading:, is_work_skin:, owner: nil)
    @skins = skins
    @heading = heading
    @is_work_skin = is_work_skin
    @owner = owner
  end

  def as_props
    {
      context: {
        heading: @heading.to_s,
        isWorkSkin: !!@is_work_skin,
        isOwner: @owner.present?,
        emptyText: @is_work_skin ? "No work skins here yet!" : "No site skins here yet!"
      },
      skins: Array(@skins).map { |s| skin(s) }.compact
    }
  end

  private

  def skin(s)
    {
      id: s.id,
      title: s.title,
      url: (skin_path(s) rescue nil),
      byline: (s.byline rescue nil),
      authorUrl: author_url(s),
      descriptionHtml: description_html(s),
      iconUrl: icon_url(s),
      iconAlt: (s.icon_alt_text.presence rescue nil),
      createdAt: (s.created_at&.to_date&.iso8601 rescue nil),
      status: (@owner.present? ? status(s) : nil)
    }
  rescue => e
    { id: (s.id rescue nil), title: (s.try(:title)), error: e.message }
  end

  def author_url(s)
    return nil unless s.author.is_a?(User)

    url_for(s.author) rescue nil
  end

  def description_html(s)
    return nil if s.description.blank?

    strip_images(sanitize_field(s, :description)).presence
  rescue
    nil
  end

  def icon_url(s)
    return nil unless s.icon.attached?

    rails_representation_path(s.icon.variant(:standard), only_path: true)
  rescue
    nil
  end

  def status(s)
    return { label: "Approved", kind: "approved" } if (s.official? rescue false)
    return { label: "Declined: #{s.admin_note}", kind: "declined" } if (s.rejected? rescue false)
    return { label: "Not yet reviewed", kind: "unread" } if (s.public? rescue false)

    nil
  end
end
