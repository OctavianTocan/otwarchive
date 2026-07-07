# Shared behavior for pages migrated to React via Inertia. A converted action
# renders React by default and keeps the original ERB reachable via
# `?ui=legacy` for parity verification and rollback. Also publishes the
# cross-page props every React page needs (flash, current user, CSRF token).
module InertiaConvertible
  extend ActiveSupport::Concern

  included do
    inertia_share do
      {
        flash: { notice: flash[:notice], error: flash[:error], alert: flash[:alert] }.compact,
        currentUser: current_user && { id: current_user.id, login: current_user.login },
        csrfToken: form_authenticity_token
      }
    end
  end

  private

  # Render `component` with the block's props unless the caller opted into the
  # legacy ERB view (`?ui=legacy`) or the block returns nil (no React path for
  # this request state). Returns true when React was rendered so callers can
  # `return if render_react(...)` and otherwise fall through to ERB.
  def render_react(component)
    return false if params[:ui] == "legacy"
    return false if request.format.js? || request.format.atom? || request.format.rss? || request.format.xml?

    props = yield
    return false if props.nil?

    render inertia: component, props: props, layout: "inertia"
    true
  end

  def render_erb_as_react(template, heading: nil)
    return false if params[:ui] == "legacy"
    return false if request.format.js? || request.format.atom? || request.format.rss? || request.format.xml?

    html = render_to_string(template: template, layout: false, formats: [:html])
    render_react("StaticPage") do
      { context: { heading: heading.to_s }, contentHtml: html }
    end
  rescue => e
    Rails.logger.warn("render_erb_as_react(#{template}) fell back to ERB: #{e.class}: #{e.message}")
    false
  end
end
