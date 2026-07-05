# Serializes works#show (full-work view) into Inertia props for the React work
# detail page. Covers single-chapter works and multi-chapter works viewed with
# ?view_full_work=true. Read-only: no comment/kudos posting.
class WorkShowPresenter < InertiaPresenter
  include HtmlCleaner

  def initialize(work:, chapters:, kudos:, view_context: nil)
    @work = work
    @chapters = chapters.presence || (work.chapters_in_order rescue [])
    @kudos = kudos
    @view = view_context
  end

  def as_props
    {
      pageTitle: (@work.title.to_s rescue ""),
      work: {
        id: @work.id,
        title: @work.title,
        url: (work_path(@work) rescue nil),
        authors: authors(@work),
        anonymous: @work.anonymous?,
        restricted: !!@work.restricted,
        complete: !!@work.complete,
        ratings: tag_refs(@work.ratings),
        warnings: tag_refs(@work.archive_warnings),
        categories: tag_refs(@work.categories),
        fandoms: tag_refs(@work.fandoms),
        relationships: tag_refs(@work.relationships),
        characters: tag_refs(@work.characters),
        freeforms: tag_refs(@work.freeforms)
      },
      summaryHtml: html_field(@work, :summary),
      notesHtml: (show_work_notes? ? html_field(@work, :notes) : nil),
      endnotesHtml: html_field(@work, :endnotes),
      stats: work_stats(@work),
      published: (@work.created_at&.to_date&.iso8601 rescue nil),
      updated: (@work.revised_at&.to_date&.iso8601 rescue nil),
      language: (@work.language&.name rescue nil),
      series: series_refs,
      collections: collection_names,
      gifts: gift_names,
      chapters: chapter_list,
      kudosNames: kudos_names,
      kudosCount: (@work.all_kudos_count rescue 0).to_i,
      workskinCss: workskin_css
    }
  rescue => e
    { pageTitle: (@work.title rescue "Work"), error: e.message }
  end

  private

  # Sanitized HTML for a userstuff field, or nil when blank. Mirrors the ERB
  # `sanitize_field` path so React output matches the legacy view.
  def html_field(object, field)
    return nil if object.nil?
    raw = object.send(field) rescue nil
    return nil if raw.blank?

    sanitize_field(object, field).presence
  end

  def show_work_notes?
    @work.notes.present? || @work.endnotes.present?
  end

  def series_refs
    Array(@work.serial_works).map do |sw|
      s = sw.series
      next nil if s.nil?

      { name: s.title, url: (series_path(s) rescue nil), part: sw.position }
    end.compact
  rescue
    []
  end

  def collection_names
    Array(@work.approved_collections).map(&:title)
  rescue
    []
  end

  def gift_names
    @work.gifts.not_rejected.map(&:recipient)
  rescue
    []
  end

  def chapter_list
    multi = Array(@chapters).size > 1
    Array(@chapters).map do |ch|
      {
        id: ch.id,
        position: ch.position,
        title: (ch.title.presence rescue nil),
        header: (ch.chapter_header rescue nil),
        contentHtml: html_field(ch, :content),
        summaryHtml: (multi ? html_field(ch, :summary) : nil),
        notesHtml: (multi ? html_field(ch, :notes) : nil),
        endnotesHtml: html_field(ch, :endnotes)
      }
    end
  end

  def kudos_names
    Array(@kudos).filter_map { |k| k.user&.login rescue nil }.first(50)
  rescue
    []
  end

  def workskin_css
    skin = @work.work_skin
    return nil if skin.nil?

    (skin.css.presence rescue nil)
  end
end
