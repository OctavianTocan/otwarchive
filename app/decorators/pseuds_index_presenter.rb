# Serializes pseuds#index (a user's list of pseuds) into Inertia props: each
# pseud's identity, icon, description, work/rec counts, and — for the owner —
# edit/delete/orphan action URLs.
class PseudsIndexPresenter < InertiaPresenter
  include HtmlCleaner

  def initialize(user:, pseuds:, work_counts:, rec_counts:, pseuds_with_works:, is_owner:, heading:)
    @user = user
    @pseuds = pseuds
    @work_counts = work_counts || {}
    @rec_counts = rec_counts || {}
    @pseuds_with_works = Array(pseuds_with_works)
    @is_owner = is_owner
    @heading = heading
  end

  def as_props
    {
      context: {
        heading: @heading.to_s,
        userLogin: @user.login,
        isOwner: !!@is_owner,
        newPseudUrl: (@is_owner ? (new_user_pseud_path(@user) rescue nil) : nil)
      },
      pseuds: Array(@pseuds).map { |p| pseud(p) },
      pagination: pagination
    }
  end

  private

  def pseud(p)
    {
      name: p.name,
      url: (user_pseud_path(p.user, p) rescue nil),
      userName: p.user_name,
      userUrl: (user_path(p.user) rescue nil),
      showUser: (p.name != p.user_name) || ((p.user.pseuds.size > 1) rescue false),
      iconUrl: icon_url(p),
      descriptionHtml: description_html(p),
      workCount: @work_counts[p.id].to_i,
      recCount: @rec_counts[p.id].to_i,
      isDefault: !!(p.is_default? rescue false),
      canEdit: !!@is_owner,
      canDelete: !!(@is_owner && !(p.is_default? rescue false) && @user.login != p.name),
      canOrphan: !!(@is_owner && @pseuds_with_works.include?(p.id)),
      editUrl: (@is_owner ? (edit_user_pseud_path(@user, p) rescue nil) : nil),
      deleteUrl: (@is_owner ? (user_pseud_path(@user, p) rescue nil) : nil),
      orphanUrl: (@is_owner ? (new_orphan_path(pseud_id: p.id) rescue nil) : nil)
    }
  rescue => e
    { name: (p.try(:name)), error: e.message }
  end

  def icon_url(p)
    return nil unless (p.icon.attached? rescue false)

    rails_blob_path(p.icon, only_path: true) rescue nil
  end

  def description_html(p)
    return nil if p.description.blank?

    sanitize_field(p, :description, image_safety_mode: true).presence
  rescue
    nil
  end

  def pagination
    {
      page: (@pseuds.current_page rescue 1) || 1,
      pages: (@pseuds.total_pages rescue 1) || 1,
      count: (@pseuds.total_entries rescue Array(@pseuds).size) || 0
    }
  end
end
