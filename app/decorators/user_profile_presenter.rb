# Serializes users#show (the user profile / dashboard) into Inertia props for
# the React profile page: identity header (login + pseuds + join date +
# counts), sanitized bio, and the recent works / series and top-fandoms modules
# the ERB dashboard renders.
class UserProfilePresenter < InertiaPresenter
  include HtmlCleaner

  def initialize(user:, works:, series:, bookmarks:, fandoms:, heading:)
    @user = user
    @works = works
    @series = series
    @bookmarks = bookmarks
    @fandoms = fandoms
    @heading = heading
  end

  def as_props
    {
      context: { heading: @heading.to_s, login: @user.login },
      pseuds: pseuds,
      bioHtml: bio_html,
      joined: @user.created_at&.to_date&.iso8601,
      counts: {
        works: (@user.works.count rescue 0).to_i,
        bookmarks: (@user.bookmarks.count rescue 0).to_i
      },
      recentWorks: Array(@works).map { |w| work_blurb(w) },
      recentSeries: Array(@series).map { |s| series_ref(s) }.compact,
      fandoms: fandoms
    }
  end

  private

  def pseuds
    Array(@user.pseuds).map do |p|
      { name: p.name, url: (user_pseud_path(p.user, p) rescue nil) }
    end
  rescue
    []
  end

  def bio_html
    prof = @user.profile
    return nil if prof.nil? || prof.about_me.blank?

    sanitize_field(prof, :about_me, image_safety_mode: true).presence
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

  # Mirrors the ERB dashboard fandom links: each fandom points at the user's
  # works filtered by that fandom (merged tag id when the fandom is a synonym),
  # and carries the work_count computed by the controller.
  def fandoms
    Array(@fandoms).map do |f|
      target_id = (f.merger_id.presence || f.id rescue f.id)
      {
        name: f.name,
        url: (user_works_path(@user, fandom_id: target_id) rescue nil),
        count: (f.respond_to?(:work_count) ? f.work_count.to_i : nil)
      }
    end
  rescue
    []
  end
end
