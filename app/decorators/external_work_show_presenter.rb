# Serializes external_works#show (a single off-site work's blurb page) into
# Inertia props for the React ExternalWorkShow page: title + external link,
# author string, required/association tags, and the sanitized summary.
class ExternalWorkShowPresenter < InertiaPresenter
  include HtmlCleaner

  def initialize(external_work:, heading:)
    @external_work = external_work
    @heading = heading
  end

  def as_props
    ew = @external_work
    {
      context: { heading: @heading.to_s },
      title: ew.title.to_s,
      externalUrl: ew.url.presence,
      author: ew.author.presence,
      fandoms: tag_refs(ew.fandoms),
      ratings: tag_refs(ew.ratings),
      warnings: tag_refs(ew.archive_warnings),
      categories: tag_refs(ew.categories),
      summaryHtml: summary_html(ew)
    }
  rescue => e
    { context: { heading: @heading.to_s }, title: (ew.try(:title).to_s), error: e.message }
  end

  private

  # Sanitized summary with images stripped, mirroring the ERB blurb's
  # strip_images(sanitize_field(...)) path, or nil when blank.
  def summary_html(ew)
    return nil if ew.try(:summary).blank?

    sanitize_field(ew, :summary, image_safety_mode: true).presence
  rescue
    nil
  end
end
