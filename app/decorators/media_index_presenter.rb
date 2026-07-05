# Serializes media#index into Inertia props for the React fandoms landing: the
# list of canonical media categories, each linking to its fandom listing.
class MediaIndexPresenter < InertiaPresenter
  def initialize(media:, heading:)
    @media = media
    @heading = heading
  end

  def as_props
    {
      context: { heading: @heading.to_s },
      media: Array(@media).map { |m| medium(m) }.compact
    }
  end

  private

  def medium(m)
    {
      name: m.name,
      url: (media_path(m) rescue nil),
      fandomsUrl: (media_fandoms_path(m) rescue nil)
    }
  rescue => e
    { name: (m.try(:name)), error: e.message }
  end
end
