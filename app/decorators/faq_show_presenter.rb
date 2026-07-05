# Serializes archive_faqs#show (a single FAQ category) into Inertia props for the
# React FaqShow page: the category title plus each question's in-page anchor,
# question text, and sanitized answer HTML (already filtered to the request
# locale by the controller).
class FaqShowPresenter < InertiaPresenter
  include HtmlCleaner

  def initialize(archive_faq:, questions:, heading:, language_id: nil)
    @archive_faq = archive_faq
    @questions = questions
    @heading = heading
    @language_id = language_id
  end

  def as_props
    {
      context: { heading: @heading.to_s, indexUrl: archive_faqs_path(language_id: @language_id) },
      title: @archive_faq.title,
      questions: Array(@questions).map do |q|
        {
          anchor: q.anchor,
          question: q.question,
          answerHtml: sanitize_field(q, :content).to_s.presence
        }
      end
    }
  rescue => e
    { context: { heading: @heading.to_s }, title: @archive_faq.try(:title), questions: [], error: e.message }
  end
end
