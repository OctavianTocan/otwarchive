# Serializes tag_set_nominations#index (the moderator "review nominations" view
# for an owned tag set) into Inertia props. One row per TagSetNomination
# submission: the nominator pseud, the tags they nominated (each with its own
# approve/reject/pending status), and a submission-level review status. The
# accessors mirror the ERB review path (pseud name/link, tag_nominations
# tagname/type/approved/rejected), which are parity-critical.
class TagSetNominationsIndexPresenter < InertiaPresenter
  def initialize(tag_set:, nominations:, heading:, pagy: nil)
    @tag_set = tag_set
    @nominations = nominations
    @heading = heading
    @pagy = pagy
  end

  def as_props
    {
      context: { heading: @heading.to_s, tagSetTitle: @tag_set&.title.to_s },
      nominations: Array(@nominations).map { |n| row(n) }.compact,
      pagination: pagination
    }
  end

  private

  def row(n)
    tags = tags_for(n)
    {
      id: n.id,
      nominator: nominator(n),
      tags: tags,
      status: submission_status(tags),
      url: (tag_set_nomination_path(@tag_set, n) rescue nil)
    }
  rescue => e
    { id: n.try(:id), nominator: nil, tags: [], status: "pending", url: nil, error: e.message }
  end

  # Nominator pseud, matching the ERB byline. Nil link when the user is gone.
  def nominator(n)
    pseud = n.pseud
    return { name: ts("(deleted)"), url: nil } unless pseud

    { name: pseud.name, url: (user_pseud_path(pseud.user, pseud) rescue nil) }
  end

  def tags_for(n)
    n.tag_nominations.map do |tn|
      {
        name: tn.tagname,
        type: tn.type.to_s.sub(/Nomination\z/, ""),
        status: tn.approved ? "approved" : (tn.rejected ? "rejected" : "pending")
      }
    end
  end

  # Submission-level state: reviewed when every tag is decided, pending when
  # none are, partial otherwise.
  def submission_status(tags)
    return "pending" if tags.empty?

    decided = tags.count { |t| t[:status] != "pending" }
    return "pending" if decided.zero?
    return "reviewed" if decided == tags.size

    "partial"
  end

  def pagination
    src = @pagy || @nominations
    {
      page: (src.current_page.to_i rescue 1),
      pages: (src.total_pages.to_i rescue 1),
      count: (src.total_entries.to_i rescue Array(@nominations).size)
    }
  end
end
