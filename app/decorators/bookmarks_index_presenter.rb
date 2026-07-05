# Serializes bookmarks#index (a user/pseud's faceted bookmark list) into Inertia
# props for the React bookmarks listing. Each bookmark wraps a bookmarkable
# (Work / Series / ExternalWork) plus the bookmarker's pseud, notes, tags, and
# rec/private flags. Work bookmarkables reuse the shared work blurb.
class BookmarksIndexPresenter < InertiaPresenter
  include HtmlCleaner

  FACET_GROUPS = [
    ["rating", "Ratings"],
    ["archive_warning", "Warnings"],
    ["category", "Categories"],
    ["fandom", "Fandoms"],
    ["character", "Characters"],
    ["relationship", "Relationships"],
    ["freeform", "Additional Tags"],
    ["tag", "Bookmarker's Tags"]
  ].freeze

  SCALARS = %w[bookmark_query bookmarkable_query bookmarker bookmark_notes rec with_notes bookmarkable_type language_id sort_column words_from words_to].freeze

  def initialize(results:, owner:, search:, heading:)
    @results = results
    @owner = owner
    @search = search
    @heading = heading
    @opts = (search.options rescue {}) || {}
  end

  def as_props
    {
      context: { heading: @heading.to_s, ownerName: owner_name },
      bookmarks: items.map { |b| bookmark(b) }.compact,
      pagination: pagination,
      facets: facets,
      filters: current_filters
    }
  end

  private

  def items
    @results.respond_to?(:items) ? @results.items : Array(@results)
  end

  def bookmark(b)
    {
      id: b.id,
      bookmarkable: bookmarkable(b.bookmarkable),
      bookmarker: bookmarker(b),
      notesHtml: notes_html(b),
      tags: tag_refs(b.tags),
      rec: !!(b.rec? rescue false),
      private: !!(b.private? rescue false),
      created: (b.created_at&.to_date&.iso8601 rescue nil)
    }
  rescue => e
    { id: (b.id rescue nil), error: e.message }
  end

  def bookmarkable(bm)
    return { type: "Deleted", title: nil, url: nil, blurb: nil } if bm.nil?

    type = bm.class.to_s
    {
      type: type,
      title: (bm.try(:title).presence || "(untitled)"),
      url: bookmarkable_url(bm),
      blurb: (type == "Work" ? work_blurb(bm) : nil)
    }
  end

  def bookmarkable_url(bm)
    case bm
    when Work then (work_path(bm) rescue nil)
    when Series then (series_path(bm) rescue nil)
    when ExternalWork then (external_work_path(bm) rescue nil)
    else nil
    end
  end

  def bookmarker(b)
    pseud = b.pseud
    return { name: nil, url: nil } if pseud.nil?

    { name: (pseud.byline rescue pseud.name), url: (user_pseud_bookmarks_path(pseud.user, pseud) rescue nil) }
  end

  # Sanitized bookmarker notes HTML, mirroring the ERB blurb's image-safe render.
  def notes_html(b)
    return nil if b.bookmarker_notes.blank?

    sanitize_field(b, :bookmarker_notes, image_safety_mode: true).presence
  rescue
    nil
  end

  def facets
    return [] unless @results.respond_to?(:facets) && @results.facets.present?

    FACET_GROUPS.filter_map do |key, label|
      group = @results.facets[key]
      next if group.blank?

      selected = Array(@opts["#{key}_ids"]).map(&:to_s)
      {
        key: key,
        label: label,
        items: group.map { |f| { value: f.id.to_s, label: f.name, count: f.count, active: selected.include?(f.id.to_s) } }
      }
    end
  end

  def pagination
    {
      page: (@results.current_page rescue 1) || 1,
      pages: (@results.total_pages rescue 1) || 1,
      count: (@results.total_entries rescue items.size) || 0
    }
  end

  def current_filters
    {
      include: FACET_GROUPS.to_h { |key, _| [key, Array(@opts["#{key}_ids"]).map(&:to_s)] },
      bookmark_search: SCALARS.index_with { |k| @opts[k] }.compact_blank,
      page: (@opts["page"] || @opts[:page] || 1).to_i
    }
  end

  def owner_name
    case @owner
    when Pseud then @owner.name
    when User then @owner.login
    when Collection then @owner.title
    else @owner.try(:name)
    end
  end
end
