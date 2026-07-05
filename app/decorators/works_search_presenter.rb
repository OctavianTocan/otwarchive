# Serializes works#search results into Inertia props for the React advanced
# works-search results page. Reuses the shared work-blurb shape from
# InertiaPresenter so search results render identically to the works listing.
class WorksSearchPresenter < InertiaPresenter
  def initialize(search:, results:, heading:)
    @search = search
    @results = results
    @heading = heading
  end

  def as_props
    {
      context: {
        heading: @heading,
        query: (@search.query.presence rescue nil),
        summary: (@search.summary.presence rescue nil)
      },
      works: items.map { |w| work_blurb(w) },
      pagination: pagination,
      resultCount: (pagination[:count]),
      filters: {
        work_search: { query: (@search.query.presence rescue nil) }.compact
      }
    }
  end

  private

  def items
    return [] if @results.blank?

    (@results.respond_to?(:items) ? @results.items : @results).compact
  end

  def pagination
    {
      page: (@results.current_page rescue 1) || 1,
      pages: (@results.total_pages rescue 1) || 1,
      count: (@results.total_entries rescue (@results.respond_to?(:size) ? @results.size : 0)) || 0
    }
  end
end
