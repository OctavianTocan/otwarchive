# Serializes fandoms#index (the per-medium fandom listing at /media/:id/fandoms)
# into Inertia props: fandoms grouped by first letter, each linking to its works
# with a work count.
class FandomsIndexPresenter < InertiaPresenter
  def initialize(fandoms_by_letter:, medium:, heading:, counts: nil)
    @by_letter = fandoms_by_letter || {}
    @medium = medium
    @heading = heading
    @counts = counts
  end

  def as_props
    {
      context: {
        heading: @heading.to_s,
        mediumName: @medium.try(:name),
        mediaUrl: (media_index_path rescue "/media")
      },
      letters: @by_letter.map { |letter, fandoms| { letter: letter.to_s, fandoms: fandoms.map { |f| fandom(f) } } }
    }
  end

  private

  def fandom(f)
    { name: f.name, url: (tag_works_path(tag_id: f.to_param) rescue nil), count: fandom_count(f) }
  rescue => e
    { name: f.try(:name), error: e.message }
  end

  def fandom_count(f)
    if f.respond_to?(:count)
      c = (f.count rescue nil)
      return c unless c.nil?
    end
    @counts && @counts[f.id]
  end
end
