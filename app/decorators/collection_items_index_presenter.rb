# Serializes collection_items#index (items submitted to a collection) into
# Inertia props for the React listing. Each collection item wraps a Work or a
# Bookmark; Work items reuse the shared work_blurb, Bookmarks get a minimal
# title/link blurb. Approval status (collection + user side) is exposed so the
# page can render review-status badges. Pagination is read from the
# will_paginate collection when no Pagy object is supplied.
class CollectionItemsIndexPresenter < InertiaPresenter
  def initialize(items:, collection:, heading:, pagy: nil)
    @items = items
    @collection = collection
    @heading = heading
    @pagy = pagy
  end

  def as_props
    {
      context: { heading: @heading.to_s, collectionName: @collection&.title.to_s },
      items: Array(@items).map { |ci| item_props(ci) },
      pagination: pagination
    }
  end

  private

  def item_props(ci)
    {
      id: ci.id,
      type: ci.item_type,
      blurb: blurb_for(ci),
      approved: ci.approved?,
      status: status_for(ci)
    }
  end

  def blurb_for(ci)
    if ci.item_type == "Work" && ci.item.present?
      work_blurb(ci.item)
    else
      bookmark_blurb(ci)
    end
  end

  def bookmark_blurb(ci)
    bookmark = ci.item
    bookmarkable = bookmark&.bookmarkable
    {
      id: bookmark&.id,
      title: bookmarkable.present? ? "Bookmark for #{bookmarkable.title}" : "Bookmark of deleted item",
      url: (bookmark ? (bookmark_path(bookmark) rescue nil) : nil)
    }
  end

  def status_for(ci)
    { collection: approval_label(ci.collection_approval_status), user: approval_label(ci.user_approval_status) }
  end

  def approval_label(value)
    case value.to_s
    when "approved" then "approved"
    when "rejected" then "rejected"
    else "unreviewed"
    end
  end

  def pagination
    {
      page: (@pagy&.page || (@items.current_page rescue nil) || 1).to_i,
      pages: (@pagy&.pages || (@items.total_pages rescue nil) || 1).to_i,
      count: (@pagy&.count || (@items.total_entries rescue nil) || Array(@items).size).to_i
    }
  end
end
