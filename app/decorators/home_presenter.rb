# Serializes home#index (the archive front page) into Inertia props for the
# React Home page. Mirrors the ERB splash: the logged-out intro/landing
# (description, live counts, account signup CTA), the news/admin posts module,
# the media-browse or favorite-tags module, and the logged-in extras (marked
# for later, unread inbox count).
class HomePresenter < InertiaPresenter
  def initialize(user:, homepage:, heading:)
    @user = user
    @homepage = homepage
    @heading = heading
  end

  def as_props
    {
      context: { heading: @heading.to_s },
      loggedIn: @homepage.logged_in?,
      intro: @homepage.logged_in? ? nil : intro,
      favorites: favorites,
      browse: browse,
      news: news,
      readings: readings,
      readingsUrl: (@homepage.logged_in? ? (user_readings_path(@user) rescue nil) : nil),
      inbox: inbox,
      social: social
    }
  end

  private

  # Logged-out landing content: description, live counts, and the account
  # signup state (which itself depends on the current AdminSetting invite flags).
  def intro
    users, works, fandoms = Array(@homepage.rounded_counts)
    {
      description: I18n.t("home.intro_module.intro_description"),
      parentOrgIntro: I18n.t("home.intro_module.parent_org_intro_html", parent_org_link: "%{link}"),
      parentOrg: { text: I18n.t("home.intro_module.parent_org"), url: "http://transformativeworks.org" },
      stats: { fandoms: fandoms.to_i, users: users.to_i, works: works.to_i },
      account: account
    }
  rescue
    nil
  end

  def account
    s = AdminSetting.current
    {
      shortName: ArchiveConfig.APP_SHORT_NAME,
      inviteNotice: invite_notice(s),
      cta: account_cta(s)
    }
  end

  # The "invitations required but currently closed" banner, shown only when the
  # queue is off but account creation still requires an invite.
  def invite_notice(s)
    return nil if s.invite_from_queue_enabled? || !s.creation_requires_invite?

    { newsUrl: admin_posts_path(tag: 143), statusUrl: status_invite_requests_path }
  end

  # The single signup call to action, matching the ERB branch that is live for
  # the current invite/creation settings; nil when signups are fully closed.
  def account_cta(s)
    if s.invite_from_queue_enabled? && s.creation_requires_invite? && s.request_invite_enabled?
      { label: "Get Invited!", url: invite_requests_path,
        note: "You can join by getting an invitation from another user or from our automated invite queue. All fans and fanworks are welcome!" }
    elsif s.invite_from_queue_enabled? && s.creation_requires_invite?
      { label: "Get Invited!", url: invite_requests_path,
        note: "You can join by getting an invitation from our automated invite queue. All fans and fanworks are welcome!" }
    elsif s.account_creation_enabled? && !s.creation_requires_invite?
      { label: "Create an Account!", url: signup_path, note: nil }
    end
  end

  # Logged-in user's favorite tags, each linking to that tag's works.
  def favorites
    return [] unless @homepage.logged_in?

    Array(@homepage.favorite_tags).map do |ft|
      t = ft.tag
      { name: t.display_name, url: (tag_works_path(t) rescue nil) }
    end
  rescue
    []
  end

  # Media-browse menu, shown when the user has no favorite tags (or is logged
  # out). Carries the optional "favorite up to N tags" hint for logged-in users.
  def browse
    media = Array(Media.for_menu).reject { |m| m.id.nil? }.map do |m|
      { name: m.name, url: (media_fandoms_path(m) rescue nil) }
    end
    note = if @homepage.logged_in?
             I18n.t("home.index.browse_or_favorite", count: ArchiveConfig.MAX_FAVORITE_TAGS)
           end
    {
      heading: I18n.t("home.index.find_your_favorites"),
      allFandomsUrl: media_index_path,
      media: media,
      note: note
    }
  rescue
    { heading: "Find your favorites", allFandomsUrl: (media_index_path rescue "#"), media: [], note: nil }
  end

  def news
    Array(@homepage.admin_posts).map do |post|
      {
        id: post.id,
        title: post.title,
        url: (polymorphic_path(post) rescue nil),
        published: post.published_at&.iso8601,
        commentsCount: (post.count_visible_comments rescue 0).to_i,
        commentsUrl: (polymorphic_path(post, show_comments: true, anchor: :comments) rescue nil),
        previewHtml: first_paragraph_html(post.content)
      }
    end
  rescue
    []
  end

  # Works the logged-in user marked for later; reuses the shared work blurb.
  def readings
    return [] unless @homepage.logged_in?

    Array(@homepage.readings).map { |r| work_blurb(r.work) if r.work }.compact
  rescue
    []
  end

  def inbox
    return nil unless @homepage.logged_in?

    count = Array(@homepage.inbox_comments).size
    return nil if count.zero?

    { count: count, url: (user_inbox_path(@user) rescue nil) }
  rescue
    nil
  end

  def social
    {
      heading: I18n.t("home.index.social.heading"),
      note: I18n.t("home.index.social.note_html", other_outlets_link: "%{link}"),
      otherOutlets: { text: I18n.t("home.index.social.other_outlets"), url: "https://www.transformativeworks.org/where-find-us/" },
      bluesky: { label: I18n.t("home.index.social.bluesky"), url: "https://bsky.app/profile/status.archiveofourown.org" },
      tumblr: { label: I18n.t("home.index.social.tumblr"), url: "https://ao3org.tumblr.com" }
    }
  end

  # First image-free paragraph of a news post's body, as a bare <p>, matching
  # the ERB `first_paragraph` preview; nil when the post has no usable text.
  def first_paragraph_html(html)
    return nil if html.blank?

    para = Nokogiri::HTML5.parse(html).at_xpath("//p[not(img)]")
    para&.text.present? ? "<p>#{ERB::Util.html_escape(para.text)}</p>" : nil
  rescue
    nil
  end
end
