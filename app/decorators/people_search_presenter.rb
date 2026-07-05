# Serializes people#search results into Inertia props for the React people
# (user/pseud) search results page. Mirrors WorksSearchPresenter: reuses the
# InertiaPresenter base so the page-specific presenter only shapes pseud blurbs.
class PeopleSearchPresenter < InertiaPresenter
  def initialize(search:, results:, heading:)
    @search = search
    @results = results
    @heading = heading
  end

  def as_props
    {
      context: {
        heading: @heading,
        query: (@search.name.presence rescue nil)
      },
      people: items.map { |p| person_blurb(p) },
      pagination: pagination,
      resultCount: pagination[:count]
    }
  end

  private

  def items
    return [] if @results.blank?

    (@results.respond_to?(:to_a) ? @results.to_a : @results).compact
  end

  # Shape a PseudDecorator search result into the blurb the React card renders,
  # using the same accessors the ERB author_blurb relies on.
  def person_blurb(pseud)
    {
      name: pseud.name,
      url: (pseud.pseud_path rescue nil),
      userLogin: (pseud.user_login rescue nil),
      workCount: (pseud.works_count.to_i rescue 0),
      fandoms: fandom_refs(pseud)
    }
  rescue => e
    { name: pseud.try(:name), error: e.message }
  end

  def fandom_refs(pseud)
    entries = (pseud.data[:fandoms] rescue nil) || []
    entries.group_by { |f| f["name"] }.map do |name, group|
      id = group.map { |f| f["id"] || f["id_for_public"] }.compact.first
      { name: name, url: (id ? (pseud.fandom_path(id) rescue nil) : nil), type: "Fandom" }
    end
  end

  def pagination
    {
      page: (@results.current_page rescue 1) || 1,
      pages: (@results.total_pages rescue 1) || 1,
      count: (@results.unlimited_total_entries rescue (@results.total_entries rescue (@results.respond_to?(:size) ? @results.size : 0))) || 0
    }
  end
end
