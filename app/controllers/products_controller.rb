require 'mini_magick'
class ProductsController < ApplicationController
  skip_before_filter :verify_authenticity_token, :only => [:pic_upload_to_local,:pic_upload_to_crop]
  def new
	  session[:image_url]=nil
    session[:product_principal_url]=nil
  end

  def create

  end

  def pic_upload_to_local
    pic = params[:personpic]
    if pic.present? && upload_file_is_image?(pic)
      if pic.size < 2048000
        name =  pic.original_filename
        directory = "public/upload"
        path = File.join(directory, name)
        FileUtils.mkdir_p(directory) unless File.exist?(directory)
        File.open(path, "wb") { |f| f.write(pic.read) }
        result = path[path.index('/')..-1]
        if params[:pic_type].present? && params[:pic_type]=='ProductPrincipal'
          session[:product_principal_url]= result
        else
          session[:image_url] = result
        end
        render json: {success: true, url: result}
      else
        @message = '上传文件大小不能超过2MB'
        render json: {success: false, message: '上传文件大小不能超过2MB'}
      end
    else
      @message = '上传的文件不是图片类型，请重新上传'
      render json: {success: false, message: '上传的文件不是图片类型，请重新上传'}
    end
  end

  def pic_upload_to_crop
    if params[:pic_type]=='ProductPrincipal'
      image_url = session[:product_principal_url] || '/images/face.png'
    else
      image_url = session[:image_url] || '/images/product_default_logo.jpg'
    end
    if image_url == '/images/product_default_logo.jpg' || image_url == '/images/face.png'
      username = 'test'
      directory = "public/upload/#{username}"
      FileUtils.mkdir_p(directory) unless File.exist?(directory)
      f = image_url.split('/').last
      FileUtils.cp("public/images/#{f}", directory)
      old_image = "#{directory}/#{f}"
    #elsif image_url=~/^http:/
    #  uri = URI.parse(image_url)
    #  if uri.scheme == 'https'
    #    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    #    http.use_ssl = true
    #  end
    #  old_image = "public/upload#{uri.request_uri}"
    #  Net::HTTP.start(uri.host, uri.port) { |http|
    #    resp = http.get(uri.request_uri)
    #    open(old_image, "wb") { |file|
    #      file.write(resp.body)
    #    }
    #  }
    else
      old_image = "public#{image_url}"
    end
    img = MiniMagick::Image.new(old_image)
    img.crop "#{params[:cropw]}x#{params[:croph]}+#{params[:cropx]}+#{params[:cropy]}"
    a=old_image.split('.')
    new_image = "#{a[0]}_new.#{a[1]}"
    new_url = new_image[6..-1]
    File.rename(old_image,new_image)
    session[:image_url]=new_url
    render json: {success: true, message: new_url}
  end

  def product_logo
    if params[:pic_type]=="ProductPrincipal"
      render json: {url: "#{session[:product_principal_url] || '/images/face.png'}"}
    else
      render json: {url: "#{session[:image_url] || '/images/product_default_logo.jpg'}"}
    end
  end

  private
  #检测上传文件是否为图片类型
  def upload_file_is_image?(file)
    type = `file --mime -b #{file.tempfile.path}`
    type =~ /^image/
  end

end
