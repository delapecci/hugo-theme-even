"use strict";

const Even = {};

Even.backToTop = function() {
  const $backToTop = $("#back-to-top");

  $(window).scroll(function() {
    if ($(window).scrollTop() > 100) {
      $backToTop.fadeIn(1000);
    } else {
      $backToTop.fadeOut(1000);
    }
  });

  $backToTop.click(function() {
    $("body,html").animate({ scrollTop: 0 });
  });
};

Even.mobileNavbar = function() {
  const $mobileNav = $("#mobile-navbar");
  const $mobileNavIcon = $(".mobile-navbar-icon");
  const slideout = new Slideout({
    panel: document.getElementById("mobile-panel"),
    menu: document.getElementById("mobile-menu"),
    padding: 180,
    tolerance: 70
  });
  slideout.disableTouch();

  $mobileNavIcon.click(function() {
    slideout.toggle();
  });

  slideout.on("beforeopen", function() {
    $mobileNav.addClass("fixed-open");
    $mobileNavIcon.addClass("icon-click").removeClass("icon-out");
  });

  slideout.on("beforeclose", function() {
    $mobileNav.removeClass("fixed-open");
    $mobileNavIcon.addClass("icon-out").removeClass("icon-click");
  });

  $("#mobile-panel").on("touchend", function() {
    slideout.isOpen() && $mobileNavIcon.click();
  });
};

Even._initToc = function() {
  const SPACING = 20;
  const $toc = $(".post-toc");
  const $footer = $(".post-footer");

  if ($toc.length) {
    const minScrollTop = $toc.offset().top - SPACING;
    const maxScrollTop = $footer.offset().top - $toc.height() - SPACING;

    const tocState = {
      start: {
        position: "absolute",
        top: minScrollTop
      },
      process: {
        position: "fixed",
        top: SPACING
      },
      end: {
        position: "absolute",
        top: maxScrollTop
      },
      bottom: {
        position: "fixed",
        top: SPACING
      }
    };

    $(window).scroll(function() {
      const scrollTop = $(window).scrollTop();

      const scrollHeight = $(document).height();
      const scrollPosition = $(window).height() + scrollTop;
      if (scrollTop < minScrollTop) {
        $toc.css(tocState.start);
      } else if (scrollTop > maxScrollTop) {
        if ((scrollHeight - scrollPosition) / scrollHeight === 0)
          $toc.css(tocState.bottom);
        else $toc.css(tocState.end);
      } else {
        if (scrollPosition >= maxScrollTop) {
          $toc.css(tocState.bottom);
        } else $toc.css(tocState.process);
      }
    });
  }

  const HEADERFIX = 30;
  const $toclink = $(".toc-link");
  const $headerlink = $(".headerlink");
  const $tocLinkLis = $(".post-toc-content li");

  let _click_toc_link_idx = -1;
  $.map($toclink, function(tl, idx) {
    $(tl).click(function() {
      _click_toc_link_idx = idx;
      // _click_active_toc_link();
    });
  });

  // const headerlinkTop = $.map($headerlink, function(link) {
  //   return $(link).offset().top;
  // });

  // const headerLinksOffsetForSearch = $.map(headerlinkTop, function(offset) {
  //   return offset - HEADERFIX;
  // });

  const searchActiveTocIndex = function(array, target) {
    let foundActiveTocIndex = -1;
    for (let i = 0; i < array.length - 1; i++) {
      if (target > array[i] && target <= array[i + 1]) {
        foundActiveTocIndex = i;
        break;
      }
    }
    if (target > array[array.length - 1]) {
      foundActiveTocIndex = array.length - 1;
    }

    if (foundActiveTocIndex < _click_toc_link_idx)
      foundActiveTocIndex = _click_toc_link_idx;

    _click_toc_link_idx = -1; // 释放锁
    return foundActiveTocIndex;
  };

  $(window).scroll(function() {
    const scrollTop = $(window).scrollTop();

    const scrollHeight = $(document).height();
    const scrollPosition = $(window).height() + scrollTop;
    const _headerlinkTop = $.map($headerlink, function(link) {
      return $(link).offset().top;
    });

    const _headerLinksOffsetForSearch = $.map(_headerlinkTop, function(offset) {
      return offset - HEADERFIX;
    });
    let activeTocIndex = searchActiveTocIndex(
      _headerLinksOffsetForSearch,
      scrollTop
    );
    // when scroll to bottom of the page
    if (
      (scrollHeight - scrollPosition) / scrollHeight === 0 &&
      activeTocIndex < $($toclink).length - 1
    ) {
      activeTocIndex += 1;
    }

    $($toclink).removeClass("active");
    $($tocLinkLis).removeClass("has-active");

    if (activeTocIndex !== -1) {
      $($toclink[activeTocIndex]).addClass("active");
      let ancestor = $toclink[activeTocIndex].parentNode;
      while (ancestor.tagName !== "NAV") {
        $(ancestor).addClass("has-active");
        ancestor = ancestor.parentNode.parentNode;
      }
    }
  });
};

Even.fancybox = function() {
  if ($.fancybox) {
    $(".post-content").each(function() {
      $(this)
        .find("img")
        .each(function() {
          $(this).wrap(
            `<a class="fancybox" href="${
              this.src
            }" data-fancybox="gallery" data-caption="${this.title}"></a>`
          );
        });
    });

    $(".fancybox").fancybox({
      selector: ".fancybox",
      protect: true
    });
  }
};

Even.highlight = function() {
  const blocks = document.querySelectorAll("pre code");
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const rootElement = block.parentElement;
    const lineCodes = block.innerHTML.split(/\n/);
    if (lineCodes[lineCodes.length - 1] === "") lineCodes.pop();
    const lineLength = lineCodes.length;

    let codeLineHtml = "";
    for (let i = 0; i < lineLength; i++) {
      codeLineHtml += `<div class="line">${i + 1}</div>`;
    }

    let codeHtml = "";
    for (let i = 0; i < lineLength; i++) {
      codeHtml += `<div class="line">${lineCodes[i]}</div>`;
    }

    block.className += " highlight";
    const figure = document.createElement("figure");
    figure.className = block.className;
    figure.innerHTML = `<table><tbody><tr><td class="gutter"><pre>${codeLineHtml}</pre></td><td class="code"><pre>${codeHtml}</pre></td></tr></tbody></table>`;

    rootElement.parentElement.replaceChild(figure, rootElement);
  }
};

Even.toc = function() {
  const tocContainer = document.getElementById("post-toc");
  if (tocContainer !== null) {
    const toc = document.getElementById("TableOfContents");
    if (toc === null) {
      // toc = true, but there are no headings
      tocContainer.parentNode.removeChild(tocContainer);
    } else {
      this._refactorToc(toc);
      this._linkToc();
      this._initToc();
    }
  }
};

Even._refactorToc = function(toc) {
  // when headings do not start with `h1`
  const oldTocList = toc.children[0];
  let newTocList = oldTocList;
  let temp;
  while (
    newTocList.children.length === 1 &&
    (temp = newTocList.children[0].children[0]).tagName === "UL"
  )
    newTocList = temp;

  if (newTocList !== oldTocList) toc.replaceChild(newTocList, oldTocList);
};

Even._linkToc = function() {
  const links = document.querySelectorAll("#TableOfContents a:first-child");
  for (let i = 0; i < links.length; i++) links[i].className += " toc-link";

  for (let num = 1; num <= 6; num++) {
    const headers = document.querySelectorAll(".post-content>h" + num);
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      header.innerHTML = `<a href="#${header.id}" class="headerlink"></a>${
        header.innerHTML
      }`;
    }
  }
};

Even.flowchart = function() {
  if (!window.flowchart) return;

  const blocks = document.querySelectorAll("pre code.language-flowchart");
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const rootElement = block.parentElement;

    const container = document.createElement("div");
    const id = `js-flowchart-diagrams-${i}`;
    container.id = id;
    container.className = "align-center";
    rootElement.parentElement.replaceChild(container, rootElement);

    const diagram = flowchart.parse(block.childNodes[0].nodeValue);
    diagram.drawSVG(
      id,
      window.flowchartDiagramsOptions ? window.flowchartDiagramsOptions : {}
    );
  }
};

Even.sequence = function() {
  if (!window.Diagram) return;

  const blocks = document.querySelectorAll("pre code.language-sequence");
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const rootElement = block.parentElement;

    const container = document.createElement("div");
    const id = `js-sequence-diagrams-${i}`;
    container.id = id;
    container.className = "align-center";
    rootElement.parentElement.replaceChild(container, rootElement);

    const diagram = Diagram.parse(block.childNodes[0].nodeValue);
    diagram.drawSVG(
      id,
      window.sequenceDiagramsOptions
        ? window.sequenceDiagramsOptions
        : { theme: "simple" }
    );
  }
};

export { Even };
