# Base for Inertia page presenters: shared work-blurb + tag serialization and
# URL helpers, so each page presenter only adds its page-specific props.
class InertiaPresenter
  include Rails.application.routes.url_helpers

  # Serialize a Work into the blurb shape shared across index/detail pages,
  # using the exact accessors the ERB blurb uses (parity-critical).
  def work_blurb(w)
    {
      id: w.id,
      title: w.title,
      url: work_path(w),
      authors: authors(w),
      anonymous: w.anonymous?,
      fandoms: tag_refs(w.fandoms),
      ratings: tag_refs(w.ratings),
      warnings: tag_refs(w.archive_warnings),
      categories: tag_refs(w.categories),
      relationships: tag_refs(w.relationships),
      characters: tag_refs(w.characters),
      freeforms: tag_refs(w.freeforms),
      summaryHtml: w.summary.presence,
      stats: work_stats(w),
      published: w.created_at&.to_date&.iso8601,
      updated: w.revised_at&.to_date&.iso8601,
      complete: !!w.complete
    }
  rescue => e
    { id: w.id, title: w.try(:title), error: e.message }
  end

  def work_stats(w)
    {
      language: w.language&.name,
      words: w.word_count.to_i,
      chapters: "#{w.number_of_chapters}/#{w.expected_number_of_chapters || "?"}",
      comments: (w.count_visible_comments rescue 0).to_i,
      kudos: (w.all_kudos_count rescue 0).to_i,
      bookmarks: (w.public_bookmarks_count rescue 0).to_i,
      hits: w.hits.to_i
    }
  end

  def authors(w)
    return [{ name: "Anonymous", url: nil }] if w.anonymous?

    w.pseuds.map { |p| { name: p.name, url: (user_pseud_path(p.user, p) rescue nil) } }
  end

  def tag_refs(tags)
    Array(tags).map { |t| { name: t.name, url: (tag_path(t) rescue nil), type: t.type } }
  end
end
