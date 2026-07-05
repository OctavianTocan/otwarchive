# Base for simple content pages (title + sanitized HTML body): known issues,
# wrangling guidelines, etc.
class ContentPagePresenter < InertiaPresenter
  include HtmlCleaner

  def index_props(records, heading:, path_helper:)
    { context: { heading: heading }, items: Array(records).map { |r| { title: r.title, url: send(path_helper, r) } } }
  end

  def show_props(record, heading:, index_url:)
    { context: { heading: heading, indexUrl: index_url }, title: record.title, contentHtml: (sanitize_field(record, :content) rescue record.content) }
  end
end
