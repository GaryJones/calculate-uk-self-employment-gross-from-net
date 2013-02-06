# jquery.calculateUKSelfEmploymentGrossFromNet.js

Given an input field for a Net income (take-home pay), calculate what the gross pay must be before Income Tax and National Insurance Contributions (Class 4) are subtracted to leave the Net amount.

This jQuery plugin is for calculators aimed at UK self-employed folks who want to know how much gross income they have to make to ensure they have a certain amount of deducations.

## Demo
[Basic Demo](http://jsfiddle.net/4XuGh/3/)

## Usage

Include references to the jQuery library and the plugin from this repo in your page. Then add:

~~~javascript
jQuery(function ($) {
    $('#net').calculateUKSelfEmploymentGrossFromNet({
	      'output': $("#gross")
    });
});
~~~
...where `#net` is the selector for the Net (input) element, and `#gross` is the selector for the Gross (calculated output) element.

The plugin accepts two arguments:

 * `output` - the input field that should display the calculated gross value.
 * `year` - the year for which data values should be used. Currently supports `2011` through to `2013`, with `2012` as the default.

## Data Sources

* [HM Revenue & Customs: Income Tax allowances](http://www.hmrc.gov.uk/rates/it.htm)
* [HM Revenue & Customs: National Insurance Contributions](http://www.hmrc.gov.uk/rates/nic.htm)


## Limitations
This is not an accounting tool, but a general estimator of values, and it has known limitations:

 * _"The Personal Allowance reduces where the income is above £100, 000 - by £1 for every £2 of income above the £100,000 limit."_ - this is not implemented.
 * 2013 sees Personal Allowance vary depending on the date of birth. The value used in this plugin is _for people born after 5 April 1948_.

## Credits
jQuery plugin: [Gary Jones](http://twitter.com/GaryJ)  
Awesome formulae around which the plugin is based: [David Waltham](http://twitter.com/David_Waltham)

Copyright © 2013 Gary Jones, [Gamajo Tech](http://gamajo.com/)  
Licensed under the [MIT License](http://gamajo.mit-license.org/2013)


