# Serializes the works#index result set into Inertia props for the React
# spike. Read-only; mirrors what app/views/works/index.html.erb renders.
class WorksIndexPresenter
  include Rails.application.routes.url_helpers

  FACET_GROUPS = [
    ["rating", "Ratings"],
    ["archive_warning", "Warnings"],
    ["category", "Categories"],
    ["fandom", "Fandoms"],
    ["character", "Characters"],
    ["relationship", "Relationships"],
    ["freeform", "Additional Tags"]
  ].freeze

  def initialize(results:, owner:, search:, heading:)
    @results = results
    @owner = owner
    @search = search
    @heading = heading
    @opts = (search.options rescue {}) || {}
  end

  def as_props
    {
      context: {
        heading: @heading,
        ownerName: @owner.try(:name),
        tagId: @owner.try(:to_param)
      },
      works: works,
      pagination: pagination,
      facets: facets,
      filters: current_filters
    }
  end

  private

  def items
    @results.respond_to?(:items) ? @results.items : @results
  end

  def works
    items.map { |w| work_blurb(w) }
  end

  def work_blurb(w)
    {
      id: w.id,
      title: w.title,
      url: work_path(w),
      authors: authors(w),
      anonymous: w.anonymous?,
      fandoms: tag_refs(w.fandoms),
      ratings: tag_refs(w.ratings),
      warnings: tag_refs(w.archive_warnings),
      categories: tag_refs(w.categories),
      relationships: tag_refs(w.relationships),
      characters: tag_refs(w.characters),
      freeforms: tag_refs(w.freeforms),
      summaryHtml: w.summary.presence,
      stats: {
        language: w.language&.name,
        words: w.word_count.to_i,
        chapters: "#{w.number_of_chapters}/#{w.expected_number_of_chapters || "?"}",
        comments: (w.count_visible_comments rescue 0).to_i,
        kudos: (w.all_kudos_count rescue 0).to_i,
        bookmarks: (w.public_bookmarks_count rescue 0).to_i,
        hits: w.hits.to_i
      },
      published: w.created_at&.to_date&.iso8601,
      updated: w.revised_at&.to_date&.iso8601,
      complete: !!w.complete
    }
  rescue => e
    { id: w.id, title: w.title, url: work_path(w), error: e.message, authors: [], fandoms: [], ratings: [], warnings: [], categories: [], relationships: [], characters: [], freeforms: [], stats: {} }
  end

  def authors(w)
    return [{ name: "Anonymous", url: nil }] if w.anonymous?

    w.pseuds.map do |p|
      { name: p.name, url: (user_pseud_path(p.user, p) rescue nil) }
    end
  end

  def tag_refs(tags)
    Array(tags).map { |t| { name: t.name, url: (tag_path(t) rescue nil), type: t.type } }
  end

  def facets
    return [] unless @results.respond_to?(:facets) && @results.facets.present?

    FACET_GROUPS.filter_map do |key, label|
      items = @results.facets[key]
      next if items.blank?

      selected = Array(@opts["#{key}_ids"]).map(&:to_s)
      {
        key: key,
        label: label,
        items: items.map { |f| { value: f.id.to_s, label: f.name, count: f.count, active: selected.include?(f.id.to_s) } }
      }
    end
  end

  def pagination
    {
      page: (@results.current_page rescue 1) || 1,
      pages: (@results.total_pages rescue 1) || 1,
      count: (@results.total_entries rescue @results.size) || 0
    }
  end

  SCALARS = %w[sort_column sort_direction complete crossover words_from words_to date_from date_to query language_id].freeze

  def current_filters
    {
      include: FACET_GROUPS.to_h { |key, _| [key, Array(@opts["#{key}_ids"]).map(&:to_s)] },
      work_search: SCALARS.index_with { |k| @opts[k] }.compact_blank,
      page: (@opts["page"] || @opts[:page] || 1).to_i
    }
  end
end
