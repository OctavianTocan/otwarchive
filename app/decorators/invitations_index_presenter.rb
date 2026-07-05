# Serializes invitations#index (a user's invitation list) into Inertia props for
# the React invitations listing. Each row mirrors the ERB invitation accessors
# (token, invitee_email, redeemed status, the redeemed-by user, created date),
# which are parity-critical. The send-invite and admin manage/delete forms are
# intentionally omitted here and tracked as a follow-up.
#
# Accepts either a preloaded/paginated `invitations:` collection or a `user:`
# (in which case the user's invitations are loaded newest-first) so it fits both
# the requested contract and the controller's live call site.
class InvitationsIndexPresenter < InertiaPresenter
  def initialize(heading:, invitations: nil, user: nil, pagy: nil)
    @invitations = invitations || (user ? user.invitations.order(created_at: :desc) : [])
    @heading = heading
    @pagy = pagy
  end

  def as_props
    {
      context: { heading: @heading.to_s },
      invitations: Array(@invitations).map { |i| row(i) }.compact,
      pagination: pagination
    }
  end

  private

  def row(i)
    {
      token: i.token,
      email: i.invitee_email.presence,
      used: i.redeemed_at.present?,
      invitedUser: invited_user(i),
      created: i.created_at&.to_date&.iso8601
    }
  rescue => e
    { token: i.try(:token), email: nil, used: false, invitedUser: nil, created: nil, error: e.message }
  end

  # The account that redeemed the invitation, mirroring the ERB `invitee_link`
  # (only User invitees are linkable). Nil when unredeemed or the user is gone.
  def invited_user(i)
    return nil unless i.invitee_type == "User"

    invitee = i.invitee
    return { name: nil, url: nil } if invitee.nil?

    { name: invitee.login, url: (user_path(invitee) rescue nil) }
  end

  def pagination
    src = @pagy || @invitations
    {
      page: (src.current_page.to_i rescue 1),
      pages: (src.total_pages.to_i rescue 1),
      count: (src.total_entries.to_i rescue Array(@invitations).size)
    }
  end
end
