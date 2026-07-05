# Serializes collections#index into Inertia props for the React collections
# listing. Covers every index variant (all collections, a user's collections,
# a parent's subcollections, a work's collections); each item is a Collection
# rendered as a blurb with maintainers, counts, and status/challenge flags.
class CollectionsIndexPresenter < InertiaPresenter
  include HtmlCleaner

  def initialize(results:, owner:, heading:)
    @results = results
    @owner = owner
    @heading = heading
  end

  def as_props
    {
      context: { heading: @heading.to_s, ownerName: owner_name },
      collections: items.map { |c| collection(c) }.compact,
      pagination: pagination
    }
  end

  private

  def items
    @results.respond_to?(:items) ? @results.items : Array(@results)
  end

  def collection(c)
    {
      id: c.id,
      title: c.title,
      name: c.name,
      url: (collection_path(c) rescue nil),
      descriptionHtml: description_html(c),
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
      anonymous: !!(c.anonymous? rescue false)
    }
  rescue => e
    { id: (c.id rescue nil), title: (c.try(:title)), error: e.message }
  end

  def maintainers(c)
    Array(c.maintainers).uniq.map do |m|
      { name: (m.byline rescue m.try(:name)), url: (user_path(m.user) rescue nil) }
    end
  rescue
    []
  end

  def description_html(c)
    return nil if c.description.blank?

    sanitize_field(c, :description, image_safety_mode: true).presence
  rescue
    nil
  end

  def challenge_type(c)
    return "Gift Exchange" if (c.gift_exchange? rescue false)
    return "Prompt Meme" if (c.prompt_meme? rescue false)

    nil
  end

  def pagination
    {
      page: (@results.current_page rescue 1) || 1,
      pages: (@results.total_pages rescue 1) || 1,
      count: (@results.total_entries rescue items.size) || 0
    }
  end

  def owner_name
    case @owner
    when Pseud then @owner.name
    when User then @owner.login
    when Collection then @owner.title
    when Work then @owner.try(:title)
    else @owner.try(:name)
    end
  end
end
