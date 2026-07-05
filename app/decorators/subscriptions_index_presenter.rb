# Serializes subscriptions#index (a user's subscription list) into Inertia props
# for the React subscriptions listing. The list is a plain will_paginate array of
# Subscription records over Work/User/Series subscribables, so there are no
# facets — just the page heading, one row per subscription, and pagination.
# Each row mirrors the ERB index accessors (name via Subscription#name, the
# polymorphic subscribable link), which are parity-critical.
class SubscriptionsIndexPresenter < InertiaPresenter
  def initialize(subscriptions:, heading:, pagy: nil)
    @subscriptions = subscriptions
    @heading = heading
    @pagy = pagy
  end

  def as_props
    {
      context: { heading: @heading.to_s },
      subscriptions: Array(@subscriptions).map { |s| row(s) }.compact,
      pagination: pagination
    }
  end

  private

  def row(s)
    {
      type: s.subscribable_type,
      name: s.name,
      url: subscribable_url(s)
    }
  rescue => e
    { type: (s.try(:subscribable_type)), name: (s.try(:name)), url: nil, error: e.message }
  end

  # Polymorphic link to the subscribed object, matching the ERB `link_to(name,
  # subscribable)`. Nil when the object is gone or is an unrevealed work (the
  # ERB shows those as plain, unlinked text).
  def subscribable_url(s)
    sub = s.subscribable
    return nil if sub.nil?
    return nil if s.subscribable_type == "Work" && (sub.unrevealed? rescue false)

    case s.subscribable_type
    when "Work" then (work_path(sub) rescue nil)
    when "Series" then (series_path(sub) rescue nil)
    when "User" then (user_path(sub) rescue nil)
    end
  end

  def pagination
    src = @pagy || @subscriptions
    {
      page: (src.current_page.to_i rescue 1),
      pages: (src.total_pages.to_i rescue 1),
      count: (src.total_entries.to_i rescue Array(@subscriptions).size)
    }
  end
end
