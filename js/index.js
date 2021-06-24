function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

function createSlider(container, duration, callback) {
  var firstItem = container.querySelector('.slider-item'); 
  var cw = container.clientWidth; 
  var count = container.children.length; 
  var curIndex = 0; 

  function setHeight() {
    container.style.height = container.children[curIndex].offsetHeight + 'px';
  }

  setHeight();

  function switchTo(index) {
    if (index < 0) {
      index = 0;
    }
    if (index > count - 1) {
      index = count - 1;
    }
    curIndex = index;
    firstItem.style.transition = '.3s';
    firstItem.style.marginLeft = -index * cw + 'px';
    setHeight();
    callback && callback(index);
  }

  var timer; 

  function startAuto() {
    if (timer || duration === 0) {
      return;
    }
    timer = setInterval(function () {
      switchTo((curIndex + 1) % count);
    }, duration);
  }

  function stopAuto() {
    clearInterval(timer);
    timer = null;
  }

  startAuto(); 

  // 手指滑动切换
  container.ontouchstart = function (e) {
    var x = e.touches[0].clientX; 
    var y = e.touches[0].clientY;
    var mL = parseFloat(firstItem.style.marginLeft) || 0;
    stopAuto();
    firstItem.style.transition = 'none';
    container.ontouchmove = function (e) {
      var disX = e.touches[0].clientX - x;
      var disY = e.touches[0].clientY - y;
      if (Math.abs(disX) < Math.abs(disY)) {
        return;
      }

      var newML = mL + disX; 
      var minML = -(count - 1) * cw; 
      if (newML < minML) {
        newML = minML;
      }
      if (newML > 0) {
        newML = 0;
      }

      e.preventDefault();
      firstItem.style.marginLeft = newML + 'px';
    };

    // 手指放开
    container.ontouchend = function (e) {
      var disX = e.changedTouches[0].clientX - x; 
      if (disX < -30) {
        switchTo(curIndex + 1);
      } else if (disX > 30) {
        switchTo(curIndex - 1);
      }
      startAuto();
    };
  };

  return switchTo;
}

// 搞定banner轮播图

(function () {
  var sliderContainer = $('.banner .slider-container');
  var dots = $('.banner .dots');
  createSlider(sliderContainer, 3000, function (index) {
    var ac = dots.querySelector('.active');
    ac && ac.classList.remove('active');
    dots.children[index].classList.add('active');
  });
})();

// 菜单区域
(function () {
  var isExpand = false; 
  $('.menu .expand').onclick = function () {
    var txt = this.querySelector('.txt');
    var spr = this.querySelector('.spr');
    var menuList = $('.menu .menu-list');
    if (isExpand) {
      txt.innerText = '展开';
      spr.classList.add('spr_expand');
      spr.classList.remove('spr_collapse');
      menuList.style.flexWrap = 'nowrap'; 
    } else {
      txt.innerText = '折叠';
      spr.classList.add('spr_collapse');
      spr.classList.remove('spr_expand');
      menuList.style.flexWrap = 'wrap'; 
    }
    isExpand = !isExpand;
  };
})();


function createBlock(blockContainer) {
  var sliderContainer = blockContainer.querySelector('.slider-container');
  var blockMenu = blockContainer.querySelector('.block-menu');
  var goto = createSlider(sliderContainer, 0, function (index) {
    var ac = blockMenu.querySelector('.active');
    if (ac) {
      ac.classList.remove('active');
    }
    blockMenu.children[index].classList.add('active');
  });
  for (let i = 0; i < blockMenu.children.length; i++) {
    blockMenu.children[i].onclick = function () {
      goto(i);
    };
  }
}

// 搞定新闻资讯
(async function () {
  var resp = await fetch('./data/news.json').then(function (resp) {
    return resp.json();
  });
  var sliderContainer = $('.news-list .slider-container');

  sliderContainer.innerHTML = Object.values(resp)
    .map(function (item) {
      return `<div class="slider-item">${item
        .map(function (item) {
          return `<div class="news-item ${item.type}">
      <a href="${item.link}">${item.title}</a>
      <span>${item.pubDate}</span>
    </div>`;
        })
        .join('')}</div>`;
    })
    .join('');

  createBlock($('.news-list'));
})();

// 英雄区域
(async function () {
  /* 
    1-战士
    2-法师
    3-坦克
    4-刺客
    5-射手
    6-辅助
  */
  var resp = await fetch('./data/hero.json').then(function (resp) {
    return resp.json();
  });
  var sliderContainer = $('.hero-list .slider-container');

  // 创建热门英雄
  createSliderItem(
    resp.filter(function (item) {
      return item.hot === 1;
    })
  );
  for (var i = 1; i <= 6; i++) {
    createSliderItem(
      resp.filter(function (item) {
        return item.hero_type === i || item.hero_type2 === i;
        // return [item.hero_type, item.hero_type2].includes(1)
      })
    );
  }

  function createSliderItem(heros) {
    var div = document.createElement('div');
    div.className = 'slider-item';
    div.innerHTML = heros
      .map(function (item) {
        return `<a>
        <img
          src="https://game.gtimg.cn/images/yxzj/img201606/heroimg/${item.ename}/${item.ename}.jpg"
        />
        <span>${item.cname}</span>
      </a>`;
      })
      .join('');
    sliderContainer.appendChild(div);
  }

  createBlock($('.hero-list'));
})();

// 视频区域
(async function () {
  var resp = await fetch('./data/video.json').then(function (resp) {
    return resp.json();
  });
  var sliderContainer = $('.video-list .slider-container');
  // 生成视频的元素
  for (var key in resp) {
    var videos = resp[key];
    // 生成一个slider-item
    var div = document.createElement('div');
    div.classList.add('slider-item');
    var html = videos
      .map(function (item) {
        // item: 每一个视频对象
        return `<a
        href="${item.link}"
      >
        <img src="${item.cover}" />
        <div class="title">
          ${item.title}
        </div>
        <div class="aside">
          <div class="play">
            <span class="spr spr_videonum"></span>
            <span>${item.playNumber}</span>
          </div>
          <div class="time">${item.pubDate}</div>
        </div>
      </a>`;
      })
      .join('');
    console.log(html);
    div.innerHTML = html;
    sliderContainer.appendChild(div);
  }
  createBlock($('.video-list'));
})();
