# Serializes series#index (a user/pseud's series list) into Inertia props for the
# React series listing. Series index is a plain ActiveRecord scope (not ES-faceted),
# so there are no facets/filters — just the owner heading, the series blurbs, and
# pagination. Each blurb mirrors the ERB _series_module accessors (parity-critical).
class SeriesIndexPresenter < InertiaPresenter
  include HtmlCleaner

  def initialize(results:, owner:, heading:)
    @results = results
    @owner = owner
    @heading = heading
  end

  def as_props
    {
      context: { heading: @heading.to_s, ownerName: owner_name },
      series: Array(@results).map { |s| blurb(s) }.compact,
      pagination: pagination
    }
  end

  private

  def blurb(s)
    {
      id: s.id,
      title: s.title,
      url: (series_path(s) rescue nil),
      creators: creators(s),
      summaryHtml: summary_html(s),
      fandoms: tag_refs(s.fandoms),
      stats: { works: s.visible_work_count.to_i, words: s.visible_word_count.to_i },
      complete: !!s.complete,
      updated: (s.revised_at&.to_date&.iso8601 rescue nil)
    }
  rescue => e
    { id: (s.id rescue nil), title: (s.try(:title)), error: e.message }
  end

  def creators(s)
    return [{ name: "Anonymous", url: nil }] if s.anonymous?

    s.pseuds.uniq.map { |p| { name: p.name, url: (user_pseud_path(p.user, p) rescue nil) } }
  end

  # Sanitized series summary HTML, mirroring the ERB blurb's image-safe render.
  def summary_html(s)
    return nil if s.summary.blank?

    sanitize_field(s, :summary, image_safety_mode: true).presence
  rescue
    nil
  end

  def pagination
    {
      page: (@results.current_page.to_i rescue 1),
      pages: (@results.total_pages.to_i rescue 1),
      count: (@results.total_entries.to_i rescue Array(@results).size)
    }
  end

  def owner_name
    case @owner
    when Pseud then @owner.name
    when User then @owner.login
    else @owner.try(:name)
    end
  end
end
