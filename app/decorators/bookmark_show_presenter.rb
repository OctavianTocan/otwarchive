# A single bookmark's page (the bookmarkable + the bookmarker's notes/tags).
class BookmarkShowPresenter < InertiaPresenter
  include HtmlCleaner

  def initialize(bookmark:, heading:)
    @bookmark = bookmark; @heading = heading
  end

  def as_props
    bk = @bookmark.bookmarkable
    {
      context: { heading: @heading },
      bookmarkable: {
        type: bk.class.to_s,
        title: (bk.try(:title) || bk.try(:name) || "Deleted item"),
        url: (polymorphic_path(bk) rescue nil),
        blurb: (bk.is_a?(Work) ? work_blurb(bk) : nil)
      },
      bookmarker: { name: (@bookmark.pseud&.name), url: (user_pseud_path(@bookmark.pseud.user, @bookmark.pseud) rescue nil) },
      notesHtml: (sanitize_field(@bookmark, :bookmarker_notes, image_safety_mode: true) rescue @bookmark.bookmarker_notes),
      tags: tag_refs(@bookmark.tags),
      rec: !!@bookmark.rec,
      private: !!@bookmark.private,
      created: @bookmark.created_at&.to_date&.iso8601
    }
  end
end
