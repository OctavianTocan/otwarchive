class SpikeController < ApplicationController
  layout "inertia"

  def hello
    render inertia: "Hello", props: { name: "AO3" }
  end
end
