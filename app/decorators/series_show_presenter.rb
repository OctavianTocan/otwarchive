# Serializes series#show (a single series landing page) into Inertia props for
# the React SeriesShow page: header/title, creators, summary + notes, stats, and
# the ordered works (each a base work blurb tagged with its series part number).
class SeriesShowPresenter < InertiaPresenter
  include HtmlCleaner

  def initialize(series:, works:, heading:)
    @series = series
    @works = works
    @heading = heading
  end

  def as_props
    s = @series
    {
      context: { heading: @heading.to_s },
      title: s.title,
      creators: creators(s),
      summaryHtml: field_html(s, :summary),
      notesHtml: field_html(s, :series_notes),
      stats: {
        works: s.visible_work_count.to_i,
        words: s.visible_word_count.to_i,
        complete: !!s.complete
      },
      updated: (s.revised_at&.to_date&.iso8601 rescue nil),
      fandoms: tag_refs(s.fandoms),
      works: Array(@works).map { |w| { part: (s.position_of(w) rescue nil), blurb: work_blurb(w) } }
    }
  rescue => e
    { context: { heading: @heading.to_s }, title: (@series.try(:title)), error: e.message }
  end

  private

  def creators(s)
    return [{ name: "Anonymous", url: nil }] if s.anonymous?

    s.pseuds.uniq.map { |p| { name: p.name, url: (user_pseud_path(p.user, p) rescue nil) } }
  end

  def field_html(record, field)
    return nil if record.try(field).blank?

    sanitize_field(record, field, image_safety_mode: true).presence
  rescue
    nil
  end
end
