# Serializes tags#index (the popular/random freeform tag cloud at /tags) into
# Inertia props. Each tag carries a size bucket (1-8) computed with the same
# log-scale as the ERB `tag_cloud` helper, plus a link to its works.
class TagsIndexPresenter < InertiaPresenter
  SIZES = 8

  def initialize(tags:, show:, heading:, logged_in:)
    @tags = Array(tags)
    @show = show
    @heading = heading
    @logged_in = logged_in
  end

  def as_props
    {
      context: {
        heading: @heading.to_s,
        show: (@show == "random" ? "random" : "popular"),
        loggedIn: !!@logged_in,
        popularUrl: (tags_path rescue "/tags"),
        randomUrl: (tags_path(show: "random") rescue "/tags?show=random"),
        searchUrl: (search_tags_path rescue "/tags/search"),
        tagSetsUrl: (tag_sets_path rescue "/tag_sets")
      },
      tags: sized_tags
    }
  end

  private

  # Mirrors TagsHelper#tag_cloud: bucket each tag into 1..8 by log(work count).
  def sized_tags
    max = -Float::INFINITY
    min = Float::INFINITY
    @tags.each do |t|
      c = t.count.to_i
      next if c.zero?

      l = Math.log(c)
      max = l if l > max
      min = l if l < min
    end
    divisor = (max - min) / SIZES

    @tags.map do |t|
      { name: t.name, url: (tag_works_path(tag_id: t.to_param) rescue nil), size: bucket(t, divisor, min) + 1 }
    end
  end

  def bucket(tag, divisor, min)
    return 0 if divisor.infinite?

    c = tag.count.to_i
    return 0 if c.zero?

    idx = (Math.log(c) - min) / divisor
    return 0 if idx.nan? || idx.negative?
    return SIZES - 1 if idx >= SIZES

    idx.floor
  end
end
