# Serializes readings#index (a user's reading history) into Inertia props for the
# React readings listing. Reading history is a plain ActiveRecord scope paginated
# with Pagy (not ES-faceted), so there are no facets/filters — just the heading,
# the reading rows (each a work blurb plus visit metadata), and pagination. A
# reading whose work was deleted keeps its row but carries a nil blurb, mirroring
# the ERB _reading_blurb "deleted work" branch (parity-critical).
class ReadingsIndexPresenter < InertiaPresenter
  def initialize(readings:, heading:, pagy: nil)
    @readings = Array(readings)
    @heading = heading
    @pagy = pagy
  end

  def as_props
    {
      context: { heading: @heading.to_s },
      readings: @readings.map { |r| reading(r) }.compact,
      pagination: pagination
    }
  end

  private

  def reading(r)
    work = r.work
    {
      blurb: (work_blurb(work) if work),
      lastViewed: (r.last_viewed&.to_date&.iso8601 rescue nil),
      viewCount: r.view_count.to_i,
      markedForLater: !!(r.toread? rescue false)
    }
  rescue => e
    { blurb: nil, lastViewed: nil, viewCount: 0, markedForLater: false, error: e.message }
  end

  def pagination
    {
      page: (@pagy&.page || 1).to_i,
      pages: (@pagy&.pages || 1).to_i,
      count: (@pagy&.count || @readings.size).to_i
    }
  end
end
