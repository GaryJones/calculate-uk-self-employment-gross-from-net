/**
 * jquery.calculateUKSelfEmploymentGrossFromNet.js
 * 
 * Given an input field for a Net income (take-home pay), calculate what the
 * gross pay must be before Income Tax and National Insurance Contributions 
 * (Class 4) are subtracted to leave the Net amount.
 * 
 * @author Gary Jones <gary@garyjones.co.uk>
 * @author David Waltham
 */

// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name jquery.calculateUKSelfEmploymentGrossFromNet.min.js
// @externs_url http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/jquery-1.8.js
// ==/ClosureCompiler==

;(function ( $, window, document, undefined ) {
  
	// Create the defaults and data values once
	var pluginName = 'calculateUKSelfEmploymentGrossFromNet',
        defaults = {
            'year' : 2012,
            'ouput': ''
        },
		// Income tax: http://www.hmrc.gov.uk/rates/it.htm
		// National Insurance Contributions (Class 4): http://www.hmrc.gov.uk/rates/nic.htm
		dataValues = {
			'2013': {
				tax: {
					personalAllowance:    9440,   // See HMRC website for important notes
					basicRate:            0.2,    // 20%
					basicRateUpperLimit:  32010,  // Above personal allowance
					higherRate:           0.4,    // 40%
					higherRateUpperLimit: 150000, // Above personal allowance
					additionalRate:       0.45    // 45%
				},
				nic: {
					lowerProfitsLimit: 7755,
					upperProfitsLimit: 41450,
					basicRate:         0.09,  // 9% - Class 4 rate between lower profits limit and upper profits limit
					higherRate:        0.02   // 2% - Class 4 rate above upper profits limit
				}
			},
			'2012': {
				tax: {
					personalAllowance:    8105,   // Does NOT account for reduction where income is above £100,000
					basicRate:            0.2,    // 20%
					basicRateUpperLimit:  34370,  // Above personal allowance
					higherRate:           0.4,    // 40%
					higherRateUpperLimit: 150000, // Above personal allowance
					additionalRate:       0.5     // 50%
				},
				nic: {
					lowerProfitsLimit: 7605,
					upperProfitsLimit: 42475,
					basicRate:         0.09,  // 9% - Class 4 rate between lower profits limit and upper profits limit
					higherRate:        0.02   // 2% - Class 4 rate above upper profits limit
				}
			},
			'2011': {
				tax: {
					personalAllowance:    7475,   // Does NOT account for reduction where income is above £100,000
					basicRate:            0.2,    // 20%
					basicRateUpperLimit:  35000,  // Above personal allowance
					higherRate:           0.4,    // 40%
					higherRateUpperLimit: 150000, // Above personal allowance
					additionalRate:       0.5     // 50%
				},
				nic: {
					lowerProfitsLimit: 7225,
					upperProfitsLimit: 42475,
					basicRate:         0.09,  // 9% - Class 4 rate between lower profits limit and upper profits limit
					higherRate:        0.02   // 2% - Class 4 rate above upper profits limit
				}
			}
		};

	/**
	 * The plugin constructor.
	 * 
	 * @constructor
	 */
	function Plugin(element, options) {
		this.element = element;
		this.options = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;

		this.init();
	}
	
	Plugin.prototype = {
		init: function() {
			// Bind our event, using $.proxy() to keep references to "this" correct inside event handler.
			$(this.element).bind('change.' + pluginName, $.proxy(this.doCalculations, this));
		},

		// This is the high level view of what we do - validate the input, calculate the output, then
		// display that output.
		doCalculations: function (event) {
            var inputValue = $(event.target).val(),
			    result;
			if (!this.inputIsValid(inputValue)) {
				alert('The Net value is not valid. It must be a whole number equal or greater than zero');
				return;
			}
			result = this.calculateGrossFromNet(inputValue);
			this.displayResult(result);
		},
		
        getTaxValues: function() {
            return dataValues[this.options.year]['tax'];
        },

        getNicValues: function() {
            return dataValues[this.options.year]['nic'];
        },
		
		calculateGrossFromNet: function (net) {
            var tax = this.getTaxValues(),
			    nic = this.getNicValues();
			
			// These thresholds are net values at which some different rules apply to the corresponding gross amount.
			// Credit to David Waltham for coming up with these formulae.
			var threshold1 = nic.lowerProfitsLimit,
                threshold2 = tax.personalAllowance - nic.basicRate * (tax.personalAllowance - nic.lowerProfitsLimit),
                threshold3 = (tax.personalAllowance + tax.basicRateUpperLimit) - tax.basicRate * tax.basicRateUpperLimit - nic.basicRate * (nic.upperProfitsLimit - nic.lowerProfitsLimit),
                threshold4 = (tax.personalAllowance + tax.higherRateUpperLimit) - tax.higherRate * (tax.higherRateUpperLimit - tax.basicRateUpperLimit) - tax.basicRate * tax.basicRateUpperLimit - nic.higherRate * (tax.personalAllowance + tax.higherRateUpperLimit - nic.upperProfitsLimit) - nic.basicRate * (nic.upperProfitsLimit - nic.lowerProfitsLimit);
			
			// Return different calculations be each threshold.
			
			if (net <= threshold1) { // No tax burden, no NIC burden
				return net; 
			}
			
			if (net <= threshold2) { // No tax burden, basic rate NIC
				return (net - nic.basicRate * nic.lowerProfitsLimit) / (1 - nic.basicRate);
			}
			
			if (net <= threshold3) { // Lower rate tax, higher rate NIC
				return (net - (nic.basicRate * nic.lowerProfitsLimit) - tax.basicRate * (tax.personalAllowance)) / (1 - nic.basicRate - tax.basicRate);
			}
			
			if (net <= threshold4) { // Higher rate tax, higher rate NIC
				return (net * 1 + nic.basicRate * (nic.upperProfitsLimit - nic.lowerProfitsLimit) + tax.basicRate * tax.basicRateUpperLimit - nic.higherRate * nic.upperProfitsLimit - tax.higherRate * (tax.personalAllowance + tax.basicRateUpperLimit)) / (1 - nic.higherRate - tax.higherRate);
			}
			
			// Otherwise, additional rate tax, higher rate NIC
			return (net * 1 + nic.basicRate * (nic.upperProfitsLimit - nic.lowerProfitsLimit) + tax.basicRate * tax.basicRateUpperLimit + tax.higherRate * (tax.higherRateUpperLimit - tax.basicRateUpperLimit) - nic.higherRate * nic.upperProfitsLimit - tax.additionalRate * (tax.higherRateUpperLimit + tax.personalAllowance)) / (1 - nic.higherRate - tax.additionalRate);
		},
		
		inputIsValid: function (net) {
			if (net < 0) {
				return false;
			}
			return true;
		},
		
		displayResult: function (value) {
			// Round to 2 decimal place.
			var rounded_value = Math.round(value*Math.pow(10,2))/Math.pow(10,2);
			this.options.output.val(rounded_value);
		}		
	};
	
    $.fn[pluginName] = function (options) {	
        return this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
            }
		});
	};
})(jQuery, window, document);
