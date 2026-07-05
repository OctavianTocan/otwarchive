# Serializes pseuds#show (a single pseud's page) into Inertia props for the
# React pseud page: identity header (pseud name + parent user link + join),
# sanitized description, work/bookmark counts, and the recent works / series
# and top-fandoms modules the ERB dashboard renders for the pseud.
class PseudShowPresenter < InertiaPresenter
  include HtmlCleaner

  def initialize(pseud:, works:, series:, fandoms:, heading:)
    @pseud = pseud
    @works = works
    @series = series
    @fandoms = fandoms
    @heading = heading
  end

  def as_props
    {
      context: { heading: @heading.to_s },
      name: @pseud.name,
      userLogin: user_login,
      userUrl: (user_path(@pseud.user) rescue nil),
      bioHtml: bio_html,
      counts: {
        works: (@pseud.works.count rescue 0).to_i,
        bookmarks: (@pseud.bookmarks.count rescue 0).to_i
      },
      recentWorks: Array(@works).map { |w| work_blurb(w) },
      recentSeries: Array(@series).map { |s| series_ref(s) }.compact,
      fandoms: fandoms
    }
  end

  private

  def user_login
    @pseud.user_name.presence || (@pseud.user&.login rescue nil)
  rescue
    nil
  end

  def bio_html
    return nil if @pseud.description.blank?

    sanitize_field(@pseud, :description, image_safety_mode: true).presence
  rescue
    nil
  end

  def series_ref(s)
    {
      id: s.id,
      title: s.title,
      url: (series_path(s) rescue nil),
      summaryHtml: (s.summary.presence rescue nil)
    }
  rescue => e
    { id: (s.id rescue nil), title: (s.try(:title)), error: e.message }
  end

  # Mirrors the ERB pseud dashboard fandom links: each fandom points at the
  # pseud's works filtered by that fandom (merged tag id when the fandom is a
  # synonym), and carries the work_count computed by the controller.
  def fandoms
    Array(@fandoms).map do |f|
      target_id = (f.merger_id.presence || f.id rescue f.id)
      {
        name: f.name,
        url: (user_pseud_works_path(@pseud.user, @pseud, fandom_id: target_id) rescue nil),
        count: (f.respond_to?(:work_count) ? f.work_count.to_i : nil)
      }
    end
  rescue
    []
  end
end
