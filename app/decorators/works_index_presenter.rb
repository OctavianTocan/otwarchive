# Serializes works#index into Inertia props for the React works listing.
class WorksIndexPresenter < InertiaPresenter
  FACET_GROUPS = [
    ["rating", "Ratings"],
    ["archive_warning", "Warnings"],
    ["category", "Categories"],
    ["fandom", "Fandoms"],
    ["character", "Characters"],
    ["relationship", "Relationships"],
    ["freeform", "Additional Tags"]
  ].freeze

  SCALARS = %w[sort_column sort_direction complete crossover words_from words_to date_from date_to query language_id].freeze

  def initialize(results:, owner:, search:, heading:)
    @results = results
    @owner = owner
    @search = search
    @heading = heading
    @opts = (search.options rescue {}) || {}
  end

  def as_props
    {
      context: { heading: @heading, ownerName: @owner.try(:name), tagId: @owner.try(:to_param) },
      works: items.map { |w| work_blurb(w) },
      pagination: pagination,
      facets: facets,
      filters: current_filters
    }
  end

  private

  def items
    @results.respond_to?(:items) ? @results.items : @results
  end

  def facets
    return [] unless @results.respond_to?(:facets) && @results.facets.present?

    FACET_GROUPS.filter_map do |key, label|
      group = @results.facets[key]
      next if group.blank?

      selected = Array(@opts["#{key}_ids"]).map(&:to_s)
      {
        key: key,
        label: label,
        items: group.map { |f| { value: f.id.to_s, label: f.name, count: f.count, active: selected.include?(f.id.to_s) } }
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

  def current_filters
    excluded_by_type = excluded_tags.group_by { |tag| tag.class.to_s.underscore }

    {
      include: FACET_GROUPS.to_h { |key, _| [key, Array(@opts["#{key}_ids"]).map(&:to_s)] },
      exclude: FACET_GROUPS.to_h { |key, _| [key, Array(excluded_by_type[key]).map { |tag| tag.id.to_s }] },
      work_search: SCALARS.index_with { |k| @opts[k] }.compact_blank,
      page: (@opts["page"] || @opts[:page] || 1).to_i
    }
  end

  def excluded_tags
    ids = Array(@opts[:excluded_tag_ids] || @opts["excluded_tag_ids"]).map(&:to_s)
    return [] if ids.blank?

    Tag.where(id: ids)
  end
end
