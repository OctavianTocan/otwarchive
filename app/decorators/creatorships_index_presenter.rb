# Serializes creatorships#show (a user's co-creator invitations) into Inertia
# props for the React listing. Each row mirrors the ERB accessors that are
# parity-critical: the polymorphic creation link, the `title_for_creation`
# label, the creation type, and the approval flag (always false here, since the
# listing is scoped to unapproved requests).
class CreatorshipsIndexPresenter < InertiaPresenter
  def initialize(creatorships:, heading:)
    @creatorships = creatorships
    @heading = heading
  end

  def as_props
    {
      context: { heading: @heading.to_s },
      creatorships: Array(@creatorships).filter_map { |c| row(c) }
    }
  end

  private

  def row(c)
    creation = c.creation
    return nil if creation.nil?

    {
      id: c.id,
      workTitle: title_for_creation(creation),
      workUrl: (polymorphic_path(creation) rescue nil),
      type: c.creation_type,
      approved: !!c.approved
    }
  rescue => e
    { id: c.try(:id), workTitle: nil, workUrl: nil, type: c.try(:creation_type), approved: false, error: e.message }
  end

  # Mirrors CreatorshipsController#title_for_creation.
  def title_for_creation(creation)
    if creation.is_a?(Chapter)
      "Chapter #{creation.position} of #{creation.work.title}"
    else
      creation.title
    end
  end
end
