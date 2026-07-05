# Members of a collection (owners/moderators/members).
class CollectionParticipantsIndexPresenter < InertiaPresenter
  def initialize(participants:, collection:, heading:)
    @participants = participants; @collection = collection; @heading = heading
  end

  def as_props
    {
      context: { heading: @heading, collectionName: @collection.try(:title) },
      participants: Array(@participants).filter_map do |p|
        next if p.pseud.nil?
        { id: p.id, name: p.pseud.name, url: (user_pseud_path(p.pseud.user, p.pseud) rescue nil), role: p.participant_role.to_s.titleize }
      end
    }
  end
end
