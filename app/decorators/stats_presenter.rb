# Serializes stats#index (a user's works statistics dashboard) into Inertia
# props for the React Stats page: the site-wide totals row and the per-fandom
# breakdown the ERB dashboard lists.
#
# `stats` bundles the controller's computed data: `:works` (works grouped by
# fandom name, as the ERB view consumes) and `:totals` (the summed counts).
class StatsPresenter < InertiaPresenter
  def initialize(user:, stats:, heading:)
    @user = user
    @grouped = (stats[:works] || {})
    @totals = (stats[:totals] || {})
    @heading = heading
  end

  def as_props
    {
      context: { heading: @heading.to_s },
      totals: {
        works: unique_works.size,
        words: @totals[:word_count].to_i,
        hits: @totals[:hits].to_i,
        kudos: @totals[:kudos].to_i,
        comments: @totals[:comment_thread_count].to_i,
        bookmarks: @totals[:bookmarks].to_i,
        subscriptions: @totals[:subscriptions].to_i
      },
      fandoms: fandoms
    }
  end

  private

  def unique_works
    @grouped.values.flatten.uniq(&:id)
  rescue
    []
  end

  def fandoms
    @grouped.keys.sort.map do |name|
      works = Array(@grouped[name])
      {
        name: name.to_s,
        works: works.size,
        words: sum(works) { |w| w.word_count },
        hits: sum(works) { |w| w.hits },
        kudos: sum(works) { |w| w.kudos.count },
        comments: sum(works) { |w| w.comment_thread_count },
        bookmarks: sum(works) { |w| w.bookmarks.count }
      }
    end
  rescue
    []
  end

  def sum(works)
    works.inject(0) { |acc, w| acc + (yield(w) || 0).to_i }
  end
end
