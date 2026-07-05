class HomeController < ApplicationController
  # unicorn_test
  def unicorn_test
  end

  def content
    @page_subtitle = t(".page_title")
    return if render_static("content")
    render action: "content", layout: "application"
  end

  def privacy
    @page_subtitle = t(".page_title")
    return if render_static("privacy")
    render action: "privacy", layout: "application"
  end

  # terms of service
  def tos
    @page_subtitle = t(".page_title")
    return if render_static("tos")
    render action: "tos", layout: "application"
  end

  # terms of service faq
  def tos_faq
    @page_subtitle = t(".page_title")
    return if render_static("tos_faq")
    render action: "tos_faq", layout: "application"
  end

  # takedown policies
  def takedown
    @page_subtitle = t(".page_title")
    return if render_static("takedown")
    render action: "takedown", layout: "application"
  end

  # lost cookie
  def lost_cookie
    return if render_static("lost_cookie")
    render action: 'lost_cookie', layout: 'application'
  end

  # for updating form tokens on cached pages
  def token_dispenser
    respond_to do |format|
      format.json { render json: { token: form_authenticity_token } }
    end
  end

  # diversity statement
  def diversity
    return if render_static("diversity_statement")
    render action: "diversity_statement", layout: "application"
  end

  # site map
  def site_map
    return if render_static("site_map")
    render action: "site_map", layout: "application"
  end

  # donate
  def donate
    @page_subtitle = t(".page_title")
    return if render_static("donate")
    render action: "donate", layout: "application"
  end

  # about
  def about
    @page_subtitle = t(".page_title")
    return if render_static("about")
    render action: "about", layout: "application"
  end

  # home page itself
  def index
    @homepage = Homepage.new(@current_user)
    unless @homepage.logged_in?
      @user_count, @work_count, @fandom_count = @homepage.rounded_counts
    end

    @hide_dashboard = true

    return if render_react("Home") do
      HomePresenter.new(user: @current_user, homepage: @homepage, heading: nil).as_props
    end

    render action: 'index', layout: 'application'
  end

  private

  # Render an otherwise-static ERB body inside the React StaticPage shell.
  # ?ui=legacy (and non-HTML formats) keep the ERB page. If the body can't be
  # rendered to a string (a partial needing context we don't have here), fall
  # back to the ERB view rather than erroring.
  def render_static(view)
    html = render_to_string(template: "home/#{view}", layout: false, formats: [:html])
    render_react("StaticPage") { { context: { heading: @page_subtitle.to_s }, contentHtml: html } }
  rescue => e
    Rails.logger.warn("render_static(#{view}) fell back to ERB: #{e.class}: #{e.message}")
    false
  end
end
