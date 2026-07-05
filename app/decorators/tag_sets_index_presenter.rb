# Serializes owned_tag_sets#index into Inertia props for the React tag-set
# listing. Covers every index variant (all tag sets, a user's tag sets, search
# results, tag sets used in a challenge); each item mirrors the ERB tag-set
# blurb: title, owners byline, description, and per-type tag counts.
class TagSetsIndexPresenter < InertiaPresenter
  include HtmlCleaner

  def initialize(results:, heading:, pagy: nil)
    @results = results
    @heading = heading
    @pagy = pagy
  end

  def as_props
    {
      context: { heading: @heading.to_s },
      tagSets: items.map { |ts| tag_set(ts) }.compact,
      pagination: pagination
    }
  end

  private

  def items
    @results.respond_to?(:items) ? @results.items : Array(@results)
  end

  def tag_set(ts)
    {
      id: ts.id,
      title: ts.title,
      url: (tag_set_path(ts) rescue nil),
      owners: owners(ts),
      descriptionHtml: description_html(ts),
      counts: counts(ts)
    }
  rescue => e
    { id: (ts.id rescue nil), title: (ts.try(:title)), error: e.message }
  end

  def owners(ts)
    Array(ts.owners).uniq.map do |owner|
      { name: (owner.byline rescue owner.try(:name)), url: (user_path(owner.user) rescue nil) }
    end
  rescue
    []
  end

  def description_html(ts)
    return nil if ts.description.blank?

    sanitize_field(ts, :description, image_safety_mode: true).presence
  rescue
    nil
  end

  def counts(ts)
    return { fandoms: 0, characters: 0, relationships: 0, freeforms: 0 } if ts.tag_set.nil?

    {
      fandoms: (ts.with_type("fandom").count rescue 0).to_i,
      characters: (ts.with_type("character").count rescue 0).to_i,
      relationships: (ts.with_type("relationship").count rescue 0).to_i,
      freeforms: (ts.with_type("freeform").count rescue 0).to_i
    }
  rescue
    { fandoms: 0, characters: 0, relationships: 0, freeforms: 0 }
  end

  def pagination
    if @pagy
      { page: (@pagy.page rescue 1).to_i, pages: (@pagy.pages rescue 1).to_i, count: (@pagy.count rescue items.size).to_i }
    else
      {
        page: ((@results.current_page rescue 1) || 1).to_i,
        pages: ((@results.total_pages rescue 1) || 1).to_i,
        count: ((@results.total_entries rescue items.size) || 0).to_i
      }
    end
  end
end
