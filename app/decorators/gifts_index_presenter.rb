# Serializes gifts#index (works gifted to a user or recipient name) into Inertia
# props for the React gifts listing. The gifted works are a plain ActiveRecord
# scope paginated with will_paginate (not ES-faceted), so there are no
# facets/filters — just the heading, the work blurbs, and pagination. Pagination
# is read from the will_paginate collection when no Pagy object is supplied.
class GiftsIndexPresenter < InertiaPresenter
  def initialize(works:, heading:, pagy: nil)
    @works = works
    @heading = heading
    @pagy = pagy
  end

  def as_props
    {
      context: { heading: @heading.to_s },
      works: Array(@works).map { |w| work_blurb(w) },
      pagination: pagination
    }
  end

  private

  def pagination
    {
      page: (@pagy&.page || (@works.current_page rescue nil) || 1).to_i,
      pages: (@pagy&.pages || (@works.total_pages rescue nil) || 1).to_i,
      count: (@pagy&.count || (@works.total_entries rescue nil) || Array(@works).size).to_i
    }
  end
end
