# Serializes the new/edit Work form into Inertia props for the React WorkForm.
# Mirrors the fields the ERB posting form (`works/_standard_form`) collects, so
# a submitted `work[...]` param payload round-trips through WorksController#create/#update.
class WorkFormPresenter < InertiaPresenter
  # @param work [Work] the (possibly unsaved) work being posted or edited
  # @param chapter [Chapter] the first/target chapter supplying content + published_at
  # @param current_user [User] the poster, used for pseud/series option sets
  # @param series [Array<Series>] the user's series available to attach to
  # @param languages [Array<Language>] selectable languages, in display order
  # @param errors [Hash] optional ActiveModel errors hash (full messages) for a re-render
  def initialize(work:, chapter:, current_user:, series: [], languages: [], errors: nil)
    @work = work
    @chapter = chapter
    @current_user = current_user
    @series = series
    @languages = languages
    @errors = errors
  end

  # @returns [Hash] props consumed by app/frontend/pages/WorkForm.tsx
  def as_props
    {
      mode: @work.persisted? ? "edit" : "new",
      action: form_action,
      method: @work.persisted? ? "put" : "post",
      posted: !!@work.posted?,
      work: work_values,
      options: option_sets,
      autocomplete: autocomplete_endpoints,
      errors: @errors
    }
  end

  private

  def form_action
    @work.persisted? ? work_path(@work) : works_path
  end

  # Current field values in the `work[...]` shape the form submits.
  def work_values
    pub = @chapter&.published_at
    {
      title: @work.title,
      rating_string: @work.rating_string.presence || default_rating_name,
      archive_warning_strings: string_list(@work.archive_warning_strings),
      category_strings: string_list(@work.category_strings),
      fandom_string: @work.fandom_string,
      relationship_string: @work.relationship_string,
      character_string: @work.character_string,
      freeform_string: @work.freeform_string,
      summary: @work.summary,
      notes: @work.notes,
      endnotes: @work.endnotes,
      language_id: @work.language_id,
      collection_names: (@work.collection_names rescue nil),
      recipients: (@work.recipients(true) rescue nil),
      backdate: !!@work.backdate,
      restricted: !!@work.restricted,
      moderated_commenting_enabled: !!@work.moderated_commenting_enabled,
      comment_permissions: @work.comment_permissions,
      chaptered: !!@work.chaptered?,
      wip_length: (@work.wip_length rescue nil),
      current_user_pseud_ids: current_pseud_ids,
      chapter: {
        title: @chapter&.title,
        content: @chapter&.content,
        published_at: {
          day: pub&.day,
          month: pub&.month,
          year: pub&.year
        }
      }
    }
  end

  def option_sets
    {
      ratings: tag_options(Rating.defaults_by_severity.compact),
      warnings: tag_options(ArchiveWarning.canonical.by_name),
      categories: tag_options(Category.canonical.by_name.sort),
      languages: @languages.map { |l| { id: l.id, name: l.name, short: l.try(:short) } },
      pseuds: pseud_options,
      series: Array(@series).map { |s| { id: s.id, title: s.title } }
    }
  end

  def autocomplete_endpoints
    {
      fandom: "/autocomplete/fandom",
      character: "/autocomplete/character_in_fandom",
      relationship: "/autocomplete/relationship_in_fandom",
      freeform: "/autocomplete/freeform",
      pseud: "/autocomplete/pseud",
      collection: "/autocomplete/open_collection_names"
    }
  end

  def tag_options(tags)
    Array(tags).map { |t| { id: t.id, name: t.name } }
  end

  def pseud_options
    return [] unless @current_user.respond_to?(:pseuds)

    @current_user.pseuds.map { |p| { id: p.id, name: p.name } }
  end

  def current_pseud_ids
    ids = (@work.current_user_pseuds || @work.pseuds rescue [])
    selected = Array(ids) & (@current_user.try(:pseuds)&.to_a || [])
    selected = [@current_user.default_pseud] if selected.empty? && @current_user.respond_to?(:default_pseud)
    selected.compact.map(&:id)
  end

  def string_list(val)
    Array(val).reject(&:blank?)
  end

  def default_rating_name
    ArchiveConfig.RATING_DEFAULT_TAG_NAME
  end
end
