# New/edit bookmark form props for a bookmarkable (Work/Series/ExternalWork).
class BookmarkFormPresenter < InertiaPresenter
  def initialize(bookmark:, bookmarkable:, current_user:, errors: nil)
    @bookmark = bookmark
    @bookmarkable = bookmarkable
    @user = current_user
    @errors = errors
  end

  def as_props
    {
      context: { heading: @bookmark&.persisted? ? "Edit Bookmark" : "New Bookmark" },
      work: { title: bookmarkable_title, url: (polymorphic_path(@bookmarkable) rescue nil) },
      action: (polymorphic_path([@bookmarkable, Bookmark]) rescue "/works/#{@bookmarkable.try(:id)}/bookmarks"),
      method: @bookmark&.persisted? ? "put" : "post",
      pseuds: (@user.pseuds.map { |p| { id: p.id, name: p.name } } rescue []),
      values: {
        pseud_id: @bookmark&.pseud_id || (@user.default_pseud&.id rescue nil),
        bookmarker_notes: (@bookmark&.bookmarker_notes rescue nil),
        tag_string: (@bookmark&.tag_string rescue nil),
        collection_names: (@bookmark&.collection_names rescue nil),
        private: !!(@bookmark&.private rescue false),
        rec: !!(@bookmark&.rec rescue false)
      },
      errors: @errors
    }
  end

  private

  def bookmarkable_title
    @bookmarkable.try(:title) || @bookmarkable.try(:name) || "this work"
  end
end
