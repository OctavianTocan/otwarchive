# Serializes inbox#show (a user's comment inbox) into Inertia props for the
# read-only React inbox. Each row mirrors the ERB accessors that are
# parity-critical: the commenter pseud/name link (get_commenter_pseud_or_name),
# the commented-on object link (commentable_description_link), the sanitized
# comment body, the posted date, and the read/replied/unreviewed flags.
# Mass read/unread/delete and inline reply/approve are intentionally omitted
# (a follow-up); this presenter only feeds the display.
class InboxPresenter < InertiaPresenter
  def initialize(comments:, heading:, pagy: nil)
    @comments = comments
    @heading = heading
    @pagy = pagy
  end

  def as_props
    {
      context: { heading: @heading.to_s },
      comments: Array(@comments).map { |ic| row(ic) }.compact,
      pagination: pagination
    }
  end

  private

  def row(ic)
    c = ic.feedback_comment
    {
      commenter: commenter_name(c),
      commenterUrl: commenter_url(c),
      anonymous: !!(c.by_anonymous_creator? rescue false),
      contentHtml: (c.sanitized_content.to_s.presence),
      created: (c.created_at&.iso8601),
      read: !!ic.read?,
      replied: !!ic.replied_to?,
      unreviewed: !!(c.unreviewed? rescue false),
      subjectTitle: subject_title(c),
      subjectUrl: subject_url(c)
    }
  rescue => e
    { commenter: nil, contentHtml: nil, created: nil, read: !!(ic.read? rescue false), subjectTitle: nil, subjectUrl: nil, error: e.message }
  end

  # Mirrors get_commenter_pseud_or_name: pseud byline, or the guest name, or a
  # deleted-account placeholder.
  def commenter_name(c)
    if c.pseud_id
      return "Account Deleted" if c.pseud.nil?

      byline = c.pseud.byline
      byline = "#{byline} (Official)" if c.pseud.user&.official
      byline
    else
      "#{c.name} (Guest)"
    end
  end

  def commenter_url(c)
    return nil if c.pseud_id.nil? || c.pseud.nil?

    user_pseud_path(c.pseud.user, c.pseud) rescue nil
  end

  # Mirrors commentable_description_link: the display title of the commented-on
  # object, with a chapter suffix for chaptered works.
  def subject_title(c)
    commentable = c.ultimate_parent
    return "Deleted Object" if commentable.blank?

    if commentable.is_a?(Tag)
      commentable.name
    elsif commentable.is_a?(AdminPost)
      commentable.title
    elsif (commentable.chaptered? rescue false)
      "#{commentable.title} (Chapter #{c.parent.position})"
    else
      commentable.title
    end
  rescue
    nil
  end

  def subject_url(c)
    commentable = c.ultimate_parent
    return nil if commentable.blank?

    if commentable.is_a?(Tag)
      tag_comment_path(commentable, c)
    elsif commentable.is_a?(AdminPost)
      admin_post_comment_path(commentable, c)
    else
      work_comment_path(commentable, c)
    end
  rescue
    nil
  end

  def pagination
    src = @pagy || @comments
    {
      page: (src.current_page.to_i rescue 1),
      pages: (src.total_pages.to_i rescue 1),
      count: (src.total_entries.to_i rescue Array(@comments).size)
    }
  end
end
