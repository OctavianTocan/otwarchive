# Serializes archive_faqs#index (the public FAQ landing page) into Inertia props
# for the React FaqIndex page: the page heading and the list of FAQ categories,
# each with its title and localized URL.
class FaqIndexPresenter < InertiaPresenter
  def initialize(archive_faqs:, heading:, language_id: nil)
    @archive_faqs = archive_faqs
    @heading = heading
    @language_id = language_id
  end

  def as_props
    {
      context: { heading: @heading.to_s },
      faqs: Array(@archive_faqs).map do |faq|
        { title: faq.title, url: archive_faq_path(faq, language_id: @language_id) }
      end
    }
  rescue => e
    { context: { heading: @heading.to_s }, faqs: [], error: e.message }
  end
end
