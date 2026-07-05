# Serializes collections#show (a single collection's landing page) into Inertia
# props for the React CollectionShow page: header/title, description + profile
# intro, maintainers, item counts, and status/challenge flags.
class CollectionShowPresenter < InertiaPresenter
  include HtmlCleaner

  def initialize(collection:, heading:)
    @collection = collection
    @heading = heading
  end

  def as_props
    c = @collection
    {
      context: { heading: @heading.to_s, name: c.name },
      title: c.title,
      descriptionHtml: field_html(c, :description),
      introHtml: intro_html(c),
      maintainers: maintainers(c),
      counts: {
        works: (c.approved_works_count rescue 0).to_i,
        bookmarks: (c.approved_bookmarked_items_count rescue 0).to_i
      },
      type: challenge_type(c),
      open: !(c.closed? rescue false),
      moderated: !!(c.moderated? rescue false),
      closed: !!(c.closed? rescue false),
      unrevealed: !!(c.unrevealed? rescue false),
      parentUrl: parent_url(c),
      worksUrl: (collection_works_path(c) rescue nil),
      bookmarksUrl: (collection_bookmarks_path(c) rescue nil)
    }
  rescue => e
    { context: { heading: @heading.to_s, name: (c.name rescue nil) }, title: (c.try(:title)), error: e.message }
  end

  private

  def maintainers(c)
    Array(c.maintainers).uniq.map do |m|
      { name: (m.byline rescue m.try(:name)), url: (user_path(m.user) rescue nil) }
    end
  rescue
    []
  end

  def field_html(record, field)
    return nil if record.try(field).blank?

    sanitize_field(record, field, image_safety_mode: true).presence
  rescue
    nil
  end

  # Profile intro falls back to the parent collection's intro, matching the ERB.
  def intro_html(c)
    profile = c.collection_profile
    return nil unless profile

    source = profile.intro.blank? ? (c.parent&.collection_profile || profile) : profile
    field_html(source, :intro)
  rescue
    nil
  end

  def parent_url(c)
    return nil unless c.parent

    collection_path(c.parent)
  rescue
    nil
  end

  def challenge_type(c)
    return "Gift Exchange" if (c.gift_exchange? rescue false)
    return "Prompt Meme" if (c.prompt_meme? rescue false)

    nil
  end
end
