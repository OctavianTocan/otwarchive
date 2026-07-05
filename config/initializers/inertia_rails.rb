InertiaRails.configure do |config|
  # @inertiajs/react 3.6 reads the initial page from a <script type="application/json">
  # element rather than the root div's data-page attribute.
  config.use_script_element_for_initial_page = true
end
