class Product < ActiveRecord::Base
  has_many :principals, dependent: :destroy
end
