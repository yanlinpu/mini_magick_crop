module ApplicationHelper
  def link_to_function(a_text,function_name,options={})
    link_to a_text,'javascript:;',options.merge!(onclick:function_name)
  end
end
