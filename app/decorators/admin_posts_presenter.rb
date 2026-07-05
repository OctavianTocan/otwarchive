# AO3 news (AdminPost) — index list + single post.
class AdminPostsPresenter < InertiaPresenter
  include HtmlCleaner

  def initialize(post: nil, posts: nil, heading:, pagy: nil, prev_post: nil, next_post: nil)
    @post = post; @posts = posts; @heading = heading; @pagy = pagy
    @prev = prev_post; @next = next_post
  end

  def index_props
    {
      context: { heading: @heading },
      posts: Array(@posts).map { |p|
        { id: p.id, title: p.title, url: admin_post_path(p),
          published: (p.published_at || p.created_at)&.to_date&.iso8601,
          contentHtml: (sanitize_field(p, :content) rescue p.content) }
      },
      pagination: pagination
    }
  end

  def show_props
    {
      context: { heading: @heading, indexUrl: admin_posts_path },
      title: @post.title,
      contentHtml: (sanitize_field(@post, :content) rescue @post.content),
      published: (@post.published_at || @post.created_at)&.to_date&.iso8601,
      prevUrl: (@prev && admin_post_path(@prev)), nextUrl: (@next && admin_post_path(@next))
    }
  end

  private

  def pagination
    { page: (@pagy&.page rescue 1) || 1, pages: (@pagy&.pages rescue 1) || 1, count: (@pagy&.count rescue Array(@posts).size) || 0 }
  end
end
