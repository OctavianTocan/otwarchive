# Serializes works#search results into Inertia props for the React advanced
# works-search results page. Reuses the shared work-blurb shape from
# InertiaPresenter so search results render identically to the works listing.
class WorksSearchPresenter < InertiaPresenter
  FORM_FIELDS = %i[
    query title creators revised_at language_id complete crossover single_chapter word_count
    fandom_names rating_ids archive_warning_ids category_ids character_names relationship_names freeform_names
    hits kudos_count comments_count bookmarks_count sort_column sort_direction
  ].freeze

  ARRAY_FIELDS = %i[rating_ids archive_warning_ids category_ids].freeze

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
        work_search: search_values
      },
      formOptions: form_options
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

  def search_values
    FORM_FIELDS.each_with_object({}) do |key, values|
      value = @search.options[key]
      next if value.blank?

      values[key] = ARRAY_FIELDS.include?(key) ? Array(value).map(&:to_s) : value.to_s
    end
  end

  def form_options
    {
      languages: Language.default_order.map { |language| { value: language.short, label: language.name } },
      ratings: Rating.defaults_by_severity.map { |tag| { value: tag.id.to_s, label: tag.name } },
      warnings: ArchiveWarning.canonical.by_name.map { |tag| { value: tag.id.to_s, label: tag.name } },
      categories: Category.canonical.by_name.sort.map { |tag| { value: tag.id.to_s, label: tag.name } },
      sortOptions: @search.sort_options.map { |label, value| { value: value, label: label } },
      sortDirections: [{ value: "asc", label: "Ascending" }, { value: "desc", label: "Descending" }]
    }
  end
end
