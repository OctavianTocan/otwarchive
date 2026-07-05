# Serializes related_works#index (a user's translations/remixes and the works
# that inspired or were inspired by them) into Inertia props for the React
# listing. The controller pre-groups the four relationship buckets into a single
# ordered list, tagging each RelatedWork with its section label; each item
# reuses the shared work blurb for the child work plus a relationship descriptor
# pointing at the parent (original) work. There is no ES faceting or real
# pagination here, so the collection renders as a single page.
class RelatedWorksIndexPresenter < InertiaPresenter
  def initialize(related_works:, heading:, pagy: nil)
    @related_works = Array(related_works)
    @heading = heading
    @pagy = pagy
  end

  def as_props
    {
      context: { heading: @heading.to_s },
      items: items,
      pagination: pagination
    }
  end

  private

  def items
    @related_works.filter_map do |entry|
      rw = entry[:record]
      next unless rw&.work && rw.parent

      {
        id: rw.id,
        groupLabel: entry[:label].to_s,
        blurb: item_blurb(rw),
        relationship: relationship(rw)
      }
    end
  end

  # nil when the child work is hidden in an unrevealed collection, so the page
  # can show a placeholder instead of a blurb.
  def item_blurb(related_work)
    work = related_work.work
    return nil if work.try(:unrevealed?)

    work_blurb(work)
  end

  def relationship(related_work)
    translation = !!related_work.translation?
    {
      kind: translation ? "translation" : "inspired",
      approved: !!related_work.reciprocal?,
      parent: parent_ref(related_work.parent),
      languageFrom: translation ? language_name(related_work.parent) : nil,
      languageTo: translation ? language_name(related_work.work) : nil
    }
  end

  def parent_ref(parent)
    return nil unless parent

    unrevealed = parent.is_a?(Work) && parent.unrevealed?
    {
      title: unrevealed ? nil : parent.title,
      url: unrevealed ? nil : (polymorphic_path(parent) rescue nil),
      external: parent.is_a?(ExternalWork),
      unrevealed: unrevealed
    }
  end

  def language_name(work)
    work.respond_to?(:language) ? work.language&.name : nil
  end

  def pagination
    {
      page: (@pagy&.page || 1).to_i,
      pages: (@pagy&.pages || 1).to_i,
      count: (@pagy&.count || @related_works.size).to_i
    }
  end
end
