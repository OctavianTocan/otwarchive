# Serializes chapters#show (single-chapter reading page) into Inertia props for
# the React chapter detail page. This is where a multi-chapter work redirects
# when not viewing the full work. Read-only: no comment/kudos posting.
class ChapterShowPresenter < InertiaPresenter
  include HtmlCleaner

  def initialize(work:, chapter:, chapters:, kudos: nil)
    @work = work
    @chapter = chapter
    @chapters = Array(chapters).presence || (work.chapters_in_order rescue [])
    @kudos = kudos
  end

  def as_props
    {
      pageTitle: chapter_page_title,
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
      language: (@work.language&.name rescue nil),
      published: (@work.created_at&.to_date&.iso8601 rescue nil),
      updated: (@work.revised_at&.to_date&.iso8601 rescue nil),
      stats: work_stats(@work),
      chapter: chapter_props,
      nav: nav_props,
      kudosNames: kudos_names,
      kudosCount: (@work.all_kudos_count rescue 0).to_i,
      workskinCss: workskin_css
    }
  rescue => e
    { pageTitle: (@work.title rescue "Chapter"), error: e.message }
  end

  private

  # Sanitized HTML for a userstuff field, or nil when blank. Mirrors the ERB
  # `sanitize_field` path so React output matches the legacy view byte-for-byte.
  def html_field(object, field)
    return nil if object.nil?
    raw = object.send(field) rescue nil
    return nil if raw.blank?

    sanitize_field(object, field).presence
  end

  def chapter_page_title
    base = @work.title.to_s
    pos = @chapter.position.to_s rescue ""
    "#{base} - Chapter #{pos}".strip
  rescue
    (@work.title.to_s rescue "")
  end

  def chapter_props
    multi = @chapters.size > 1
    {
      id: @chapter.id,
      position: @chapter.position,
      header: (@chapter.chapter_header rescue nil),
      title: (@chapter.title.presence rescue nil),
      contentHtml: html_field(@chapter, :content),
      summaryHtml: (multi ? html_field(@chapter, :summary) : nil),
      notesHtml: (multi ? html_field(@chapter, :notes) : nil),
      endnotesHtml: html_field(@chapter, :endnotes)
    }
  end

  def nav_props
    index = @chapters.index(@chapter)
    prev_ch = (index && index > 0) ? @chapters[index - 1] : nil
    next_ch = (index && index < @chapters.size - 1) ? @chapters[index + 1] : nil
    {
      prevUrl: (prev_ch && (work_chapter_path(@work, prev_ch) rescue nil)),
      nextUrl: (next_ch && (work_chapter_path(@work, next_ch) rescue nil)),
      index: (index ? index + 1 : (@chapter.position rescue 1)),
      total: @chapters.size,
      chapters: @chapters.map do |ch|
        {
          position: ch.position,
          title: (ch.title.presence rescue nil),
          url: (work_chapter_path(@work, ch) rescue nil)
        }
      end
    }
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
