$(document).ready(function() {
  var KB      = 1024;
  var MS_IN_S = 1000;

  var parser;

  var buildAndParseTimer = null;
  var parseTimer         = null;

  var oldGrammar   = null;
  var oldParserVar = null;
  var oldStartRule = null;
  var oldInput     = null;

  function build() {
    oldGrammar   = $("#grammar").val();
    oldParserVar = $("#parser-var").val();
    oldStartRule = $("#start-rule").val();

    try {
      var timeBefore = (new Date).getTime();
      parser = PEG.buildParser($("#grammar").val(), $("#start-rule").val());
      var timeAfter = (new Date).getTime();

      $("#build-message")
        .attr("class", "message info")
        .html("Parser built successfully.")
        .append(
          "<span class=\"time\" title=\"Parser build time and speed\">"
          + (timeAfter - timeBefore)
          + "&nbsp;ms, "
          + (($("#grammar").val().length / KB) / ((timeAfter - timeBefore) / MS_IN_S)).toPrecision(2)
          + "&nbsp;kB/s"
          + "</span>"
        );
      var parserUrl = "data:text/plain;charset=utf-8;base64,"
        + Base64.encode($("#parser-var").val() + " = " + parser.toSource() + ";\n");
      $("#parser-download").show().attr("href", parserUrl);
      $("#input").removeAttr("disabled");

      return true;
    } catch (e) {
      var message = e.line !== undefined && e.column !== undefined
        ? "Line " + e.line + ", column " + e.column + ": " + e.message
        : e.message;

      $("#build-message")
        .attr("class", "message error")
        .text(message);
      var parserUrl = "data:text/plain;charset=utf-8;base64,"
        + Base64.encode("Parser not available.");
      $("#parser-download").hide();
      $("#input").attr("disabled", "disabled");
      $("#parse-message")
        .attr("class", "message disabled")
        .text("Parser not available.");
      $("#output").addClass("not-available").text("(no output available)");
    }
  }

  function parse() {
    oldInput = $("#input").val();

    try {
      var timeBefore = (new Date).getTime();
      var output = parser.parse($("#input").val());
      var timeAfter = (new Date).getTime();

      $("#parse-message")
        .attr("class", "message info")
        .text("Input parsed successfully.")
        .append(
          "<span class=\"time\" title=\"Parsing time and speed\">"
          + (timeAfter - timeBefore)
          + "&nbsp;ms, "
          + (($("#input").val().length / KB) / ((timeAfter - timeBefore) / MS_IN_S)).toPrecision(2)
          + "&nbsp;kB/s"
          + "</span>"
        );
      $("#output").removeClass("not-available").html(jsDump.parse(output));

      return true;
    } catch (e) {
      var message = e.line !== undefined && e.column !== undefined
        ? "Line " + e.line + ", column " + e.column + ": " + e.message
        : e.message;

      $("#parse-message")
        .attr("class", "message error")
        .text(message)
      $("#output").addClass("not-available").text("(no output available)");

      return false;
    }
  }

  function buildAndParse() {
    build() && parse();
  }

  function scheduleBuildAndParse() {
    var nothingChanged = $("#grammar").val() === oldGrammar
      && $("#parser-var").val() === oldParserVar
      && $("#start-rule").val() === oldStartRule;
    if (nothingChanged) { return; }

    if (buildAndParseTimer !== null) {
      clearTimeout(buildAndParseTimer);
      buildAndParseTimer = null;
    }
    if (parseTimer !== null) {
      clearTimeout(parseTimer);
      parseTimer = null;
    }

    buildAndParseTimer = setTimeout(function() {
      buildAndParse();
      buildAndParseTimer = null;
    }, 500);
  }

  function scheduleParse() {
    if ($("#input").val() === oldInput) { return; }
    if (buildAndParseTimer !== null) { return; }

    if (parseTimer !== null) {
      clearTimeout(parseTimer);
      parseTimer = null;
    }

    parseTimer = setTimeout(function() {
      parse();
      parseTimer = null;
    }, 500);
  }

  jsDump.HTML = true;

  $("#grammar, #start-rule, #parser-var")
    .change(scheduleBuildAndParse)
    .mousedown(scheduleBuildAndParse)
    .mouseup(scheduleBuildAndParse)
    .click(scheduleBuildAndParse)
    .keydown(scheduleBuildAndParse)
    .keyup(scheduleBuildAndParse)
    .keypress(scheduleBuildAndParse);

  $("#input")
    .change(scheduleParse)
    .mousedown(scheduleParse)
    .mouseup(scheduleParse)
    .click(scheduleParse)
    .keydown(scheduleParse)
    .keyup(scheduleParse)
    .keypress(scheduleParse);

  $("#settings-link").toggle(function() {
    $(this).html("&laquo; Detailed settings");
    $("#settings").slideDown();
    return false;
  }, function() {
    $(this).html("Detailed settings &raquo;");
    $("#settings").slideUp();
    return false;
  });

  $("#grammar").focus();

  buildAndParse();
});
